"""
Real-time streaming via Socket.IO
==================================

Each connected client gets an independent playback session.
The server pushes one data frame at a time with a configurable delay
that mirrors the original 15-second sample interval scaled by speed.

── Client → Server events ──────────────────────────────────────────────────
  start_stream  { speed: 1-120, start_idx: 0 }
                Begin (or restart) streaming from start_idx.
                speed=1  → real-time (15 s per frame)
                speed=10 → 1.5 s per frame  (default)
                speed=60 → 250 ms per frame

  stop_stream   {}
                Pause the stream; keeps current position.

  seek          { idx: N }
                Jump to frame N and emit that single frame immediately.
                Does not start/stop an active stream.

  set_speed     { speed: N }
                Change playback speed mid-stream.

── Server → Client events ──────────────────────────────────────────────────
  connected     { total_rows, columns, phases }
                Sent once on connect.

  frame         { idx, row: {...}, health: {...} }
                One sensor snapshot.

  stream_state  { status: "playing"|"paused"|"complete", idx }
                Sent whenever stream state changes.

  error         { message }
"""

import asyncio
import math
import socketio

from . import data_store
from .routers.health import (
    _check_temp, _check_pressure, _check_fad, _check_voltage,
    _check_tol_flow, _check_tol_spc, _overall,
)
from .compressor_inference import CompressorInference, SensorStreamBuffer

# ── ML Engine Initialization ──────────────────────────────────────────────────
import os
from pathlib import Path
_ROOT = Path(__file__).resolve().parent
_MODEL_PATH = _ROOT / "data" / "quantile_models.pkl"

_engine = None
try:
    if _MODEL_PATH.exists():
        _engine = CompressorInference(str(_MODEL_PATH))
        print(f"[ml] engine loaded from {_MODEL_PATH}")
    else:
         print(f"[ml] warning: model not found at {_MODEL_PATH}")
except Exception as e:
    print(f"[ml] error loading engine: {e}")

def _augment_ml_result(result: dict, engine: CompressorInference) -> dict:
    """Attach param_status and readiness as seen in the reference implementation."""
    cur = result.get("current_sensors", {})
    pred = result.get("predicted_sensors", {})
    
    # Simple readiness check for the primary FAD metric
    fad_now = cur.get("fad_cfm")
    rated_fad = engine.stable_ref.get("fad_cfm", 0.0)
    
    tolerance_pct = 6.0 # standard default
    tolerance_factor = (100.0 - tolerance_pct) / 100.0
    spec_min = rated_fad * tolerance_factor if rated_fad else None
    
    margin_pct = None
    if spec_min and fad_now is not None and spec_min > 0:
        margin_pct = round(((fad_now - spec_min) / spec_min) * 100, 2)

    result["readiness"] = {
        "spec_min": round(spec_min, 2) if spec_min else None,
        "margin_pct": margin_pct,
        "ss_ref": round(rated_fad, 2) if rated_fad else None,
        "tolerance_pct": tolerance_pct,
    }
    
    # Parameter health counters based on model's statistical references
    g, a, r = 0, 0, 0
    for s in engine.sensors:
        val = cur.get(s)
        ref = engine.stable_ref.get(s)
        std = engine.stable_std.get(s)
        if val is not None and ref is not None and std and std > 0:
            sig = abs((val - ref) / std)
            if sig < 1.0: g += 1
            elif sig < 2.0: a += 1
            else: r += 1
        elif val is not None:
            g +=1
            
    result["param_status"] = {"green": g, "amber": a, "red": r}
    
    # Expose reference targets for frontend "Sigma Analysis"
    result["targets"] = {
        s: {"ref": round(float(engine.stable_ref[s]), 3), "std": round(float(engine.stable_std[s]), 4)}
        for s in engine.sensors
    }
    
    return result

# ── Socket.IO server (async, CORS open for dev) ─────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# ── Per-session state ────────────────────────────────────────────────────────
# { sid: { task: asyncio.Task | None, speed: int, idx: int, buffer: SensorStreamBuffer | None } }
_sessions: dict[str, dict] = {}

_SAMPLE_INTERVAL_SEC = 15  # seconds between rows in the dataset


def _delay_for_speed(speed: int) -> float:
    """
    Returns the sleep interval in seconds for the given playback speed.
    Mirrors HTML: Math.max(50, 15000/speed) ms  → max(0.05, 15/speed) seconds.
    """
    speed = max(1, min(speed, 1000))
    return max(0.05, _SAMPLE_INTERVAL_SEC / speed)


_PHASE_LABELS = {
    "Phase1_Warmup":        "WARMUP",
    "Phase2_Stabilization": "STABILIZING",
    "Phase3_StableRated":   "RATED RUN",
    "Phase4_UnloadCycle":   "UNLOAD CYCLE",
}


def _elapsed_label(sec) -> str:
    """h:mm:ss — mirrors the HTML elStr calculation."""
    try:
        sec = int(sec)
    except (TypeError, ValueError):
        return "--:--:--"
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    return f"{h}:{m:02d}:{s:02d}"


def _build_frame(idx: int, sid: str = None) -> dict:
    """Build the full frame payload for one row index."""
    row = data_store.row_as_dict(idx)
    sess = _sessions.get(sid) if sid else None

    def g(key):
        v = row.get(key)
        if v is None:
            return None
        try:
            f = float(v)
            return None if (math.isnan(f) or math.isinf(f)) else round(f, 4)
        except (TypeError, ValueError):
            return v

    at = g("airend_discharge_temp_c")

    # ── Computed display fields (mirrors HTML renderFrame logic) ──────────────
    phase = row.get("phase")
    phase_label = _PHASE_LABELS.get(phase, phase or "--")

    # Fan status: HTML checks airend_discharge_temp_c thresholds
    if at is None:
        fan_status = "STANDBY"
    elif at < 40:
        fan_status = "STANDBY"
    elif at < 70:
        fan_status = "WARMING"
    else:
        fan_status = "RUNNING"

    # Airend heat fill ratio: Math.max(0, Math.min(1, (at-30)/65))
    if at is not None:
        airend_fill_ratio = max(0.0, min(1.0, (at - 30) / 65))
    else:
        airend_fill_ratio = 0.0

    elapsed_sec = row.get("elapsed_time_sec")
    elapsed_label = _elapsed_label(elapsed_sec)

    # Tolerance pass/fail — mirrors utol() conditions in HTML
    tf = g("tolerance_flow_pct")
    ts = g("tolerance_spc_pct")
    tol_flow_pass = (tf is not None) and (tf > 0) and (tf <= 12)
    tol_spc_pass  = (ts is not None) and (ts > -8) and (ts <= 5)

    # ── Health alerts ─────────────────────────────────────────────────────────
    alerts = [
        _check_temp("airend_discharge_temp_c",   "Airend Discharge Temp",  at),
        _check_temp("oil_cooler_inlet_temp_c",   "Oil Cooler Inlet",       g("oil_cooler_inlet_temp_c")),
        _check_temp("oil_cooler_outlet_temp_c",  "Oil Cooler Outlet",      g("oil_cooler_outlet_temp_c")),
        _check_temp("aftercooler_inlet_temp_c",  "After Cooler Inlet",     g("aftercooler_inlet_temp_c")),
        _check_temp("aftercooler_outlet_temp_c", "After Cooler Outlet",    g("aftercooler_outlet_temp_c")),
        _check_pressure(g("delivery_pressure_kg_cm2g")),
        _check_fad(g("fad_cfm")),
        _check_voltage(g("input_voltage_v")),
        _check_tol_flow(tf),
        _check_tol_spc(ts),
    ]
    health = {
        "overall": _overall(alerts),
        "alerts": [
            {"field": a.field, "label": a.label, "value": a.value,
             "unit": a.unit, "status": a.status, "message": a.message}
            for a in alerts
        ],
    }

    # ── Clean raw row for JSON ────────────────────────────────────────────────
    clean_row = {}
    for k, v in row.items():
        if v is None:
            clean_row[k] = None
        else:
            try:
                f = float(v)
                clean_row[k] = None if (math.isnan(f) or math.isinf(f)) else round(f, 4)
            except (TypeError, ValueError):
                clean_row[k] = v

    # ── ML Inference ─────────────────────────────────────────────────────────
    ml_data = None
    if _engine and sess and "buffer" in sess:
        # Buffer needs elapsed_time_min
        elapsed_min = g("elapsed_time_min") or (g("elapsed_time_sec") / 60.0 if g("elapsed_time_sec") else 0.0)
        
        # Prepare sensor dict for buffer
        sensor_vals = {s: g(s) or 0.0 for s in _engine.sensors}
        
        # Append to session buffer and predict
        window = sess["buffer"].append(elapsed_min, sensor_vals)
        
        # Add 'extra' columns if they exist in dataset (for feature engineering)
        for col in ["rated_fad_cfm", "rated_motor_output_kw", "tolerance_flow_pct"]:
            if col in row:
                window[col] = float(row[col]) if row[col] is not None else 0.0
        
        try:
            pred = _engine.predict(window)
            ml_data = _augment_ml_result(pred, _engine)
        except Exception as e:
            print(f"[ml] prediction error: {e}")

    return {
        "idx": idx,
        "row": clean_row,
        "health": health,
        "ml": ml_data,
        # Computed display fields — ready to render without frontend logic
        "display": {
            "phase_label":       phase_label,       # "WARMUP" | "STABILIZING" | "RATED RUN" | "UNLOAD CYCLE"
            "fan_status":        fan_status,         # "STANDBY" | "WARMING" | "RUNNING"
            "elapsed_label":     elapsed_label,      # "1:23:45"
            "airend_fill_ratio": airend_fill_ratio,  # 0.0 – 1.0  (SVG heat fill)
            "tol_flow_pass":     tol_flow_pass,      # True/False
            "tol_spc_pass":      tol_spc_pass,       # True/False
        },
    }


# ── Background streaming task ─────────────────────────────────────────────────

async def _stream_task(sid: str):
    """Runs as an asyncio Task; streams frames to one client until done or cancelled."""
    sess = _sessions[sid]
    total = data_store.total_rows()

    while sess["idx"] < total:
        idx = sess["idx"]
        frame = _build_frame(idx, sid)
        await sio.emit("frame", frame, to=sid)

        sess["idx"] += 1
        if sess["idx"] >= total:
            break

        delay = _delay_for_speed(sess["speed"])
        try:
            await asyncio.sleep(delay)
        except asyncio.CancelledError:
            return  # graceful stop

    # Stream finished naturally
    await sio.emit("stream_state", {"status": "complete", "idx": sess["idx"]}, to=sid)
    sess["task"] = None


def _cancel_task(sid: str):
    task = _sessions[sid].get("task")
    if task and not task.done():
        task.cancel()
    _sessions[sid]["task"] = None


# ── Socket.IO event handlers ──────────────────────────────────────────────────

@sio.event
async def connect(sid, environ, auth=None):
    _sessions[sid] = {
        "task": None, 
        "speed": 10, 
        "idx": 0,
        "buffer": SensorStreamBuffer(_engine.sensors) if _engine else None
    }
    try:
        df = data_store.get_df()
        payload = {
            "total_rows": len(df),
            "columns": list(df.columns),
            "phases": list(df["phase"].unique()) if "phase" in df.columns else [],
        }
    except Exception:
        payload = {"total_rows": 0, "columns": [], "phases": []}
    await sio.emit("connected", payload, to=sid)
    print(f"[socket] connect    sid={sid}")


@sio.event
async def disconnect(sid):
    if sid in _sessions:
        _cancel_task(sid)
        del _sessions[sid]
    print(f"[socket] disconnect sid={sid}")


@sio.event
async def start_stream(sid, data):
    """
    data: { speed?: int, start_idx?: int }
    """
    sess = _sessions.get(sid)
    if not sess:
        return

    speed = int(data.get("speed", sess["speed"]))
    start_idx = int(data.get("start_idx", sess["idx"]))
    total = data_store.total_rows()

    if start_idx < 0 or start_idx >= total:
        await sio.emit("error", {"message": f"start_idx {start_idx} out of range (0-{total-1})"}, to=sid)
        return

    # Stop any running task, reset position
    _cancel_task(sid)
    sess["speed"] = speed
    sess["idx"] = start_idx

    # Launch streaming task
    task = asyncio.get_event_loop().create_task(_stream_task(sid))
    sess["task"] = task
    await sio.emit("stream_state", {"status": "playing", "idx": start_idx}, to=sid)
    print(f"[socket] start_stream sid={sid} speed={speed}x start={start_idx}")


@sio.event
async def stop_stream(sid, data=None):
    sess = _sessions.get(sid)
    if not sess:
        return
    _cancel_task(sid)
    await sio.emit("stream_state", {"status": "paused", "idx": sess["idx"]}, to=sid)
    print(f"[socket] stop_stream  sid={sid} at idx={sess['idx']}")


@sio.event
async def seek(sid, data):
    """
    data: { idx: int }
    Emits the frame at that index immediately without touching stream state.
    """
    sess = _sessions.get(sid)
    if not sess:
        return

    idx = int(data.get("idx", 0))
    total = data_store.total_rows()
    if idx < 0 or idx >= total:
        await sio.emit("error", {"message": f"idx {idx} out of range (0-{total-1})"}, to=sid)
        return

    sess["idx"] = idx
    frame = _build_frame(idx, sid)
    await sio.emit("frame", frame, to=sid)


@sio.event
async def set_speed(sid, data):
    """
    data: { speed: int }
    Changes playback speed on-the-fly; restarts task if currently playing.
    """
    sess = _sessions.get(sid)
    if not sess:
        return

    speed = max(1, int(data.get("speed", 10)))
    was_playing = sess["task"] and not sess["task"].done()
    sess["speed"] = speed

    if was_playing:
        _cancel_task(sid)
        task = asyncio.get_event_loop().create_task(_stream_task(sid))
        sess["task"] = task

    await sio.emit("stream_state", {
        "status": "playing" if was_playing else "paused",
        "idx": sess["idx"],
        "speed": speed,
    }, to=sid)
    print(f"[socket] set_speed    sid={sid} speed={speed}x")
