"""
Quick Socket.IO stream test.
Run AFTER starting the server:
    uvicorn backend.main:app --port 8001

Usage:
    .venv/Scripts/python test_socketio.py
"""

import asyncio
import socketio

URL = "http://localhost:8001"
frames_received = []

sio = socketio.AsyncClient()


@sio.on("connected")
async def on_connected(data):
    print(f"[connected] total_rows={data['total_rows']}  phases={data['phases']}")


@sio.on("stream_state")
async def on_state(data):
    print(f"[stream_state] {data}")


@sio.on("frame")
async def on_frame(data):
    idx = data["idx"]
    row = data["row"]
    health = data["health"]
    frames_received.append(idx)
    print(
        f"  frame {idx:>3} | phase={row.get('phase','?'):<22} "
        f"temp={row.get('airend_discharge_temp_c','--'):>6} C  "
        f"fad={row.get('fad_cfm','--'):>7} CFM  "
        f"pres={row.get('delivery_pressure_kg_cm2g','--'):>5} kg/cm2  "
        f"health={health['overall']}"
    )
    # Stop after 6 frames to keep the test short
    if len(frames_received) >= 6:
        await sio.emit("stop_stream", {})


@sio.on("error")
async def on_error(data):
    print(f"[error] {data}")


async def main():
    print("=== Socket.IO Real-time Stream Test ===")
    print(f"Connecting to {URL} ...")
    await sio.connect(URL, transports=["websocket"])

    # Test 1: stream at 120x from the stable-rated phase (approx idx 241)
    print("\n--- Test 1: stream 6 frames at 120x speed from idx 241 ---")
    await sio.emit("start_stream", {"speed": 120, "start_idx": 241})
    await asyncio.sleep(3)

    # Test 2: seek to a specific frame
    print("\n--- Test 2: seek to idx 500 ---")
    frames_received.clear()
    await sio.emit("seek", {"idx": 500})
    await asyncio.sleep(0.5)

    # Test 3: change speed mid-stream
    print("\n--- Test 3: start at 60x then change to 120x ---")
    frames_received.clear()
    await sio.emit("start_stream", {"speed": 60, "start_idx": 600})
    await asyncio.sleep(0.5)
    await sio.emit("set_speed", {"speed": 120})
    await asyncio.sleep(3)

    await sio.disconnect()
    print("\n=== Test complete ===")


if __name__ == "__main__":
    asyncio.run(main())
