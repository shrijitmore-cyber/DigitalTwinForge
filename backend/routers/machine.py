"""Machine metadata endpoint."""

from fastapi import APIRouter
from ..models import MachineInfo

router = APIRouter(prefix="/machine", tags=["Machine"])


@router.get("", response_model=MachineInfo, summary="Static machine metadata")
def get_machine():
    """
    Returns the fixed nameplate and design data for the KES 22-8.5 compressor unit.
    """
    return MachineInfo(
        model="KES 22-8.5",
        serial="SCR0010046 T1",
        working_pressure_kg_cm2=8.0,
        rated_fad_cfm=127.0,
        motor_kw=22.0,
        motor_rpm=2930,
        fan_kw=1.1,
        fan_rpm=2870,
        description="Oil-injected rotary screw air compressor, KRMS V30 controller",
    )
