"""
KES 22-8.5 Digital Twin — FastAPI + Socket.IO Backend
======================================================

Start with:
    uvicorn backend.main:app --reload --port 8000

REST docs:      http://localhost:8000/docs
Socket.IO path: ws://localhost:8000/socket.io/

Socket.IO events
----------------
  Client → Server:
    start_stream  { speed?: int, start_idx?: int }
    stop_stream   {}
    seek          { idx: int }
    set_speed     { speed: int }

  Server → Client:
    connected     { total_rows, columns, phases }
    frame         { idx, row: {...}, health: {...} }
    stream_state  { status: "playing"|"paused"|"complete", idx }
    error         { message }
"""

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import machine, data, kpis, trends, health, upload
from . import data_store
from .socket_server import sio
from .auth import router as auth_router, init_db

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

fastapi_app = FastAPI(
    title="KES 22-8.5 Digital Twin API",
    description=(
        "REST + Socket.IO API for the KES 22-8.5 digital twin. "
        "Exposes time-series sensor data, KPI aggregations, trend windows, "
        "health/alert evaluation, dataset upload, and real-time streaming."
    ),
    version="1.0.0",
    contact={"name": "Digital Twin Platform"},
)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# REST Routers
# ---------------------------------------------------------------------------

API = "/api"

fastapi_app.include_router(auth_router,    prefix=API)
fastapi_app.include_router(machine.router, prefix=API)
fastapi_app.include_router(data.router,    prefix=API)
fastapi_app.include_router(kpis.router,    prefix=API)
fastapi_app.include_router(trends.router,  prefix=API)
fastapi_app.include_router(health.router,  prefix=API)
fastapi_app.include_router(upload.router,  prefix=API)

# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@fastapi_app.get("/", tags=["Root"])
def root():
    total = 0
    try:
        total = data_store.total_rows()
    except Exception:
        pass
    return {
        "service": "KES 22-8.5 Digital Twin API",
        "version": "1.0.0",
        "rows_loaded": total,
        "docs": "/docs",
        "socketio": "/socket.io/",
    }


# ---------------------------------------------------------------------------
# Startup — pre-load the default dataset
# ---------------------------------------------------------------------------

@fastapi_app.on_event("startup")
def _preload():
    init_db()
    try:
        data_store.get_df()
        print(f"[startup] Dataset loaded: {data_store.total_rows()} rows")
    except Exception as exc:
        print(f"[startup] No default dataset — upload via POST /api/upload ({exc})")


# ---------------------------------------------------------------------------
# Mount Socket.IO on top of FastAPI (combined ASGI app)
# Socket.IO handles /socket.io/*, FastAPI handles everything else.
# ---------------------------------------------------------------------------

app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
