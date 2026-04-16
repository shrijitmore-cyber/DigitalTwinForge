"""
Time-series data endpoints.

GET /api/data               – paginated rows (all or filtered by phase)
GET /api/data/{idx}         – single row by row index
GET /api/data/phases        – list phases with summary info
GET /api/data/phases/{name} – rows for one phase (paginated)
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from .. import data_store
from ..models import DataRow, DataPage, PhaseSummary

router = APIRouter(prefix="/data", tags=["Time-Series Data"])


def _build_row(idx: int, raw: dict) -> DataRow:
    return DataRow(idx=idx, **{k: raw.get(k) for k in DataRow.model_fields if k != "idx"})


# ── All rows (paginated) ────────────────────────────────────────────────────

@router.get("", response_model=DataPage, summary="Paginated time-series rows")
def get_data(
    skip: int = Query(0, ge=0, description="Number of rows to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max rows to return"),
    phase: Optional[str] = Query(None, description="Filter by phase name"),
):
    """
    Returns paginated raw sensor rows.

    - **skip / limit** — standard pagination
    - **phase** — optionally filter to one of:
      `Phase1_Warmup`, `Phase2_Stabilization`, `Phase3_StableRated`, `Phase4_UnloadCycle`
    """
    rows_raw = data_store.rows_as_dicts(skip=skip, limit=limit, phase=phase)
    df = data_store.get_df()
    total = len(df[df["phase"] == phase]) if phase else len(df)

    # Attach absolute indices (within the full frame, not the filtered slice)
    rows = []
    global_skip = skip
    if phase:
        df_filtered = df[df["phase"] == phase].reset_index()
        for i, raw in enumerate(rows_raw):
            abs_idx = int(df_filtered.iloc[skip + i]["index"]) if skip + i < len(df_filtered) else skip + i
            rows.append(_build_row(abs_idx, raw))
    else:
        for i, raw in enumerate(rows_raw):
            rows.append(_build_row(skip + i, raw))

    return DataPage(total=total, skip=skip, limit=limit, phase_filter=phase, rows=rows)


# ── Single row by index ─────────────────────────────────────────────────────

@router.get("/{idx}", response_model=DataRow, summary="Single sensor frame by row index")
def get_row(idx: int):
    """Returns one sensor snapshot at the given zero-based row index."""
    total = data_store.total_rows()
    if idx < 0 or idx >= total:
        raise HTTPException(status_code=404, detail=f"Index {idx} out of range (0–{total-1})")
    return _build_row(idx, data_store.row_as_dict(idx))


# ── Phase list ───────────────────────────────────────────────────────────────

@router.get("/phases/list", response_model=list[PhaseSummary], summary="All phases with time range info")
def list_phases():
    """Returns each phase with row count and start/end timestamps."""
    df = data_store.get_df()
    summaries = []
    for phase in df["phase"].unique():
        subset = df[df["phase"] == phase]
        summaries.append(PhaseSummary(
            phase=phase,
            row_count=len(subset),
            start_time=subset["timestamp"].iloc[0] if "timestamp" in subset.columns else None,
            end_time=subset["timestamp"].iloc[-1] if "timestamp" in subset.columns else None,
            elapsed_start_sec=int(subset["elapsed_time_sec"].iloc[0]) if "elapsed_time_sec" in subset.columns else None,
            elapsed_end_sec=int(subset["elapsed_time_sec"].iloc[-1]) if "elapsed_time_sec" in subset.columns else None,
        ))
    return summaries


# ── Rows for a specific phase ────────────────────────────────────────────────

@router.get("/phases/{phase_name}", response_model=DataPage, summary="Rows for a specific phase")
def get_phase_data(
    phase_name: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    """Returns paginated rows filtered to the requested phase."""
    valid = data_store.get_phases()
    if phase_name not in valid:
        raise HTTPException(status_code=404, detail=f"Phase '{phase_name}' not found. Valid: {valid}")
    return get_data(skip=skip, limit=limit, phase=phase_name)
