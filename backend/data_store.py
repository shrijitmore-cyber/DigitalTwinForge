"""
In-memory data store for KES 22-8.5 Digital Twin.
Loads the Excel dataset on startup; supports hot-reload via upload endpoint.
"""

import math
import os
from pathlib import Path
from typing import Optional

import pandas as pd

# ---------------------------------------------------------------------------
# Default dataset path (relative to this file's parent directory)
# ---------------------------------------------------------------------------
_DEFAULT_PATH = Path(__file__).parent.parent / "KES22_8p5_synthetic_test_data.xlsx"

# ---------------------------------------------------------------------------
# In-memory store
# ---------------------------------------------------------------------------
_df: Optional[pd.DataFrame] = None


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    """Normalise column types and sanitise NaN / Inf for JSON serialisation."""
    # Convert timestamp to ISO string if it is a datetime
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"]).dt.strftime("%Y-%m-%d %H:%M:%S")
    # Replace inf/-inf with None, then NaN with None
    df = df.replace([float("inf"), float("-inf")], None)
    return df


def load_from_file(path: str | Path) -> None:
    """Load dataset from an Excel or CSV file and replace the store."""
    global _df
    path = Path(path)
    if path.suffix.lower() in (".xlsx", ".xls"):
        df = pd.read_excel(path)
    elif path.suffix.lower() == ".csv":
        df = pd.read_csv(path)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix}")
    _df = _clean(df)


def load_from_bytes(data: bytes, filename: str) -> None:
    """Load dataset from raw bytes (used by upload endpoint)."""
    import io
    global _df
    suffix = Path(filename).suffix.lower()
    buf = io.BytesIO(data)
    if suffix in (".xlsx", ".xls"):
        df = pd.read_excel(buf)
    elif suffix == ".csv":
        df = pd.read_csv(buf)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")
    _df = _clean(df)


def get_df() -> pd.DataFrame:
    """Return the active DataFrame, loading default file if necessary."""
    global _df
    if _df is None:
        if _DEFAULT_PATH.exists():
            load_from_file(_DEFAULT_PATH)
        else:
            raise RuntimeError("No dataset loaded. Upload a CSV or Excel file first.")
    return _df


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def total_rows() -> int:
    return len(get_df())


def row_as_dict(idx: int) -> dict:
    df = get_df()
    row = df.iloc[idx].where(pd.notnull(df.iloc[idx]), None)
    return row.to_dict()


def rows_as_dicts(skip: int = 0, limit: int = 100, phase: Optional[str] = None) -> list[dict]:
    df = get_df()
    if phase:
        df = df[df["phase"] == phase]
    chunk = df.iloc[skip: skip + limit]
    # Replace NaN with None for JSON
    return chunk.where(pd.notnull(chunk), None).to_dict(orient="records")


def get_phases() -> list[str]:
    return list(get_df()["phase"].unique())


def stats_for_columns(cols: list[str], phase: Optional[str] = None) -> dict:
    """Return min/max/mean/std for a list of columns."""
    df = get_df()
    if phase:
        df = df[df["phase"] == phase]
    result = {}
    for col in cols:
        if col not in df.columns:
            continue
        s = df[col].dropna()
        result[col] = {
            "min": _safe(s.min()),
            "max": _safe(s.max()),
            "mean": _safe(s.mean()),
            "std": _safe(s.std()),
            "count": int(s.count()),
        }
    return result


def _safe(val):
    """Convert numpy scalar to plain Python, return None for NaN/Inf."""
    if val is None:
        return None
    try:
        v = float(val)
        if math.isnan(v) or math.isinf(v):
            return None
        return round(v, 4)
    except (TypeError, ValueError):
        return val
