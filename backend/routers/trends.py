"""
Trend (chart) data endpoint.

GET /api/trends  – returns the last `window` rows up to (and including) `idx`,
                   formatted for Chart.js consumption.
"""

from typing import Optional
import math
from fastapi import APIRouter, Query, HTTPException

from .. import data_store
from ..models import TrendSeries

router = APIRouter(prefix="/trends", tags=["Trends / Charts"])


def _safe_val(v) -> Optional[float]:
    if v is None:
        return None
    try:
        f = float(v)
        return None if (math.isnan(f) or math.isinf(f)) else round(f, 3)
    except (TypeError, ValueError):
        return None


def _elapsed_label(sec) -> str:
    try:
        sec = int(sec)
    except (TypeError, ValueError):
        return "--"
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    return f"{h}:{m:02d}:{s:02d}"


@router.get("", response_model=TrendSeries, summary="Windowed trend data for charts")
def get_trends(
    idx: int = Query(..., ge=0, description="Current frame index (inclusive end of window)"),
    window: int = Query(60, ge=1, le=721, description="Number of frames to include"),
):
    """
    Returns a sliding window of sensor values suitable for Chart.js line charts.

    - **idx** — the most-recent frame (inclusive)
    - **window** — how many frames to look back (default 60 = last 15 min at 15-sec intervals)

    Response includes `labels` (elapsed-time strings) plus arrays for the five
    key chart channels used in the frontend.
    """
    total = data_store.total_rows()
    if idx >= total:
        raise HTTPException(status_code=404, detail=f"idx {idx} out of range (0–{total-1})")

    start = max(0, idx - window + 1)
    df = data_store.get_df()
    subset = df.iloc[start: idx + 1]

    labels = [_elapsed_label(v) for v in subset.get("elapsed_time_sec", [])]

    def col(name):
        return [_safe_val(v) for v in subset[name]] if name in subset.columns else []

    return TrendSeries(
        labels=labels,
        airend_discharge_temp_c=col("airend_discharge_temp_c"),
        fad_cfm=col("fad_cfm"),
        motor_output_power_kw=col("motor_output_power_kw"),
        delivery_pressure_kg_cm2g=col("delivery_pressure_kg_cm2g"),
        package_input_power_kw=col("package_input_power_kw"),
    )
