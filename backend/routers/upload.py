"""
Dataset upload endpoint.

POST /api/upload  – accepts an Excel (.xlsx) or CSV file and
                    replaces the in-memory dataset.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException

from .. import data_store
from ..models import UploadResponse

router = APIRouter(prefix="/upload", tags=["Dataset Upload"])


@router.post("", response_model=UploadResponse, summary="Upload a new CSV or Excel dataset")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Replace the active dataset with an uploaded file.

    Accepted formats: `.xlsx`, `.xls`, `.csv`

    Expected columns (same as the synthetic test data):
    `timestamp`, `elapsed_time_sec`, `phase`, sensor columns…
    """
    filename = file.filename or ""
    if not filename.lower().endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a .xlsx, .xls, or .csv file.",
        )
    data = await file.read()
    try:
        data_store.load_from_bytes(data, filename)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {exc}")

    df = data_store.get_df()
    return UploadResponse(
        status="ok",
        rows_loaded=len(df),
        columns=list(df.columns),
        phases=list(df["phase"].unique()) if "phase" in df.columns else [],
    )
