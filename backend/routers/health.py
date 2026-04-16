"""
Health / alert endpoint.

GET /api/health?idx=N  – evaluates threshold rules for row N and returns
                          per-field status + an overall severity.

Thresholds mirror the frontend JS logic in compressor_iso_twin2.html:
  - airend_discharge_temp_c  : warn > 65 °C, hot (alert) > 88 °C
  - delivery_pressure_kg_cm2g: warn if < 6.5 or > 8.6 kg/cm²g
  - fad_cfm                  : warn if < 120 CFM
  - input_voltage_v          : warn if < 373 V or > 456 V
  - tolerance_flow_pct       : pass only if 0 < val ≤ 12 %
  - tolerance_spc_pct        : pass only if -8 < val ≤ 5 %
"""

from typing import Optional
from fastapi import APIRouter, Query, HTTPException

from .. import data_store
from ..models import HealthStatus, AlertItem

router = APIRouter(prefix="/health", tags=["Health & Alerts"])


# ── Threshold rules ─────────────────────────────────────────────────────────

def _check_temp(field: str, label: str, val: Optional[float]) -> AlertItem:
    # Status names match the HTML CSS classes: 'hot' > 88, 'warm' > 65, 'ok'
    if val is None:
        status, msg = "unknown", "No data"
    elif val > 88:
        status, msg = "hot", f"{val:.1f} degC - above critical limit (88 degC)"
    elif val > 65:
        status, msg = "warm", f"{val:.1f} degC - above warm limit (65 degC)"
    else:
        status, msg = "ok", None
    return AlertItem(field=field, label=label, value=val, unit="degC", status=status, message=msg)


def _check_pressure(val: Optional[float]) -> AlertItem:
    if val is None:
        status, msg = "unknown", "No data"
    elif val > 8.6 or val < 6.5:
        status, msg = "warn", f"{val:.2f} kg/cm2g - outside normal band (6.5-8.6)"
    else:
        status, msg = "ok", None
    return AlertItem(
        field="delivery_pressure_kg_cm2g",
        label="Delivery Pressure",
        value=val, unit="kg/cm²g",
        status=status, message=msg,
    )


def _check_fad(val: Optional[float]) -> AlertItem:
    if val is None:
        status, msg = "unknown", "No data"
    elif val < 120:
        status, msg = "warn", f"{val:.1f} CFM - below minimum (120 CFM)"
    else:
        status, msg = "ok", None
    return AlertItem(
        field="fad_cfm", label="FAD Output",
        value=val, unit="CFM",
        status=status, message=msg,
    )


def _check_voltage(val: Optional[float]) -> AlertItem:
    if val is None:
        status, msg = "unknown", "No data"
    elif val < 373 or val > 456:
        status, msg = "warn", f"{val:.0f} V - outside supply band (373-456 V)"
    else:
        status, msg = "ok", None
    return AlertItem(
        field="input_voltage_v", label="Input Voltage",
        value=val, unit="V",
        status=status, message=msg,
    )


def _check_tol_flow(val: Optional[float]) -> AlertItem:
    if val is None:
        status, msg = "unknown", "No data"
    elif val > 0 and val <= 12:
        status, msg = "ok", None
    else:
        status, msg = "warn", f"{val:+.1f}% - outside flow tolerance window (0 to +12%)"
    return AlertItem(
        field="tolerance_flow_pct", label="Flow Tolerance",
        value=val, unit="%",
        status=status, message=msg,
    )


def _check_tol_spc(val: Optional[float]) -> AlertItem:
    if val is None:
        status, msg = "unknown", "No data"
    elif val > -8 and val <= 5:
        status, msg = "ok", None
    else:
        status, msg = "warn", f"{val:+.1f}% - outside SPC tolerance window (-8 to +5%)"
    return AlertItem(
        field="tolerance_spc_pct", label="SPC Tolerance",
        value=val, unit="%",
        status=status, message=msg,
    )


# ── Severity aggregation ────────────────────────────────────────────────────

_SEVERITY = {"ok": 0, "unknown": 1, "warn": 2, "warm": 2, "alert": 3, "hot": 3}


def _overall(items: list[AlertItem]) -> str:
    worst = max(_SEVERITY.get(i.status, 0) for i in items) if items else 0
    return {0: "ok", 1: "ok", 2: "warn", 3: "alert"}[worst]


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.get("", response_model=HealthStatus, summary="Health and alert status for a given frame")
def get_health(
    idx: int = Query(..., ge=0, description="Row index to evaluate"),
):
    """
    Evaluates all threshold rules against the sensor values at `idx` and
    returns a per-field alert list plus an overall severity (`ok` / `warn` / `alert`).
    """
    total = data_store.total_rows()
    if idx >= total:
        raise HTTPException(status_code=404, detail=f"idx {idx} out of range (0–{total-1})")

    row = data_store.row_as_dict(idx)

    def g(key):
        v = row.get(key)
        return None if v is None else float(v)

    alerts = [
        _check_temp("airend_discharge_temp_c", "Airend Discharge Temp", g("airend_discharge_temp_c")),
        _check_temp("oil_cooler_inlet_temp_c", "Oil Cooler Inlet", g("oil_cooler_inlet_temp_c")),
        _check_temp("oil_cooler_outlet_temp_c", "Oil Cooler Outlet", g("oil_cooler_outlet_temp_c")),
        _check_temp("aftercooler_inlet_temp_c", "After Cooler Inlet", g("aftercooler_inlet_temp_c")),
        _check_temp("aftercooler_outlet_temp_c", "After Cooler Outlet", g("aftercooler_outlet_temp_c")),
        _check_pressure(g("delivery_pressure_kg_cm2g")),
        _check_fad(g("fad_cfm")),
        _check_voltage(g("input_voltage_v")),
        _check_tol_flow(g("tolerance_flow_pct")),
        _check_tol_spc(g("tolerance_spc_pct")),
    ]

    return HealthStatus(
        overall=_overall(alerts),
        idx=idx,
        timestamp=row.get("timestamp"),
        phase=row.get("phase"),
        alerts=alerts,
    )
