"""
KPI aggregation endpoints.

GET /api/kpis/summary        – all KPI groups in one call
GET /api/kpis/thermal        – thermal temperatures
GET /api/kpis/pressure-flow  – pressure & flow
GET /api/kpis/electrical     – electrical
GET /api/kpis/spc            – SPC & tolerances
"""

from typing import Optional
from fastapi import APIRouter, Query

from .. import data_store
from ..models import (
    KPISummary, ThermalKPIs, PressureFlowKPIs, ElectricalKPIs, SPCKPIs, FieldStats,
)

router = APIRouter(prefix="/kpis", tags=["KPIs"])

# Column groups
_THERMAL_COLS = [
    "airend_discharge_temp_c",
    "oil_cooler_inlet_temp_c",
    "oil_cooler_outlet_temp_c",
    "aftercooler_inlet_temp_c",
    "aftercooler_outlet_temp_c",
    "air_inlet_temp_c",
]
_PRESSURE_FLOW_COLS = [
    "delivery_pressure_kg_cm2g",
    "aos_tank_inlet_pressure_kg_cm2g",
    "fad_cfm",
]
_ELECTRICAL_COLS = [
    "motor_output_power_kw",
    "package_input_power_kw",
    "input_voltage_v",
    "current_package_input_a",
    "power_factor",
]
_SPC_COLS = [
    "spc_kw_per_m3_min",
    "tolerance_flow_pct",
    "tolerance_spc_pct",
]


def _fs(stats: dict, col: str) -> FieldStats:
    s = stats.get(col, {})
    return FieldStats(
        min=s.get("min"),
        max=s.get("max"),
        mean=s.get("mean"),
        std=s.get("std"),
        count=s.get("count", 0),
    )


def _thermal(phase):
    s = data_store.stats_for_columns(_THERMAL_COLS, phase)
    return ThermalKPIs(
        airend_discharge_temp_c=_fs(s, "airend_discharge_temp_c"),
        oil_cooler_inlet_temp_c=_fs(s, "oil_cooler_inlet_temp_c"),
        oil_cooler_outlet_temp_c=_fs(s, "oil_cooler_outlet_temp_c"),
        aftercooler_inlet_temp_c=_fs(s, "aftercooler_inlet_temp_c"),
        aftercooler_outlet_temp_c=_fs(s, "aftercooler_outlet_temp_c"),
        air_inlet_temp_c=_fs(s, "air_inlet_temp_c"),
    )


def _pressure_flow(phase):
    s = data_store.stats_for_columns(_PRESSURE_FLOW_COLS, phase)
    return PressureFlowKPIs(
        delivery_pressure_kg_cm2g=_fs(s, "delivery_pressure_kg_cm2g"),
        aos_tank_inlet_pressure_kg_cm2g=_fs(s, "aos_tank_inlet_pressure_kg_cm2g"),
        fad_cfm=_fs(s, "fad_cfm"),
    )


def _electrical(phase):
    s = data_store.stats_for_columns(_ELECTRICAL_COLS, phase)
    return ElectricalKPIs(
        motor_output_power_kw=_fs(s, "motor_output_power_kw"),
        package_input_power_kw=_fs(s, "package_input_power_kw"),
        input_voltage_v=_fs(s, "input_voltage_v"),
        current_package_input_a=_fs(s, "current_package_input_a"),
        power_factor=_fs(s, "power_factor"),
    )


def _spc(phase):
    s = data_store.stats_for_columns(_SPC_COLS, phase)
    return SPCKPIs(
        spc_kw_per_m3_min=_fs(s, "spc_kw_per_m3_min"),
        tolerance_flow_pct=_fs(s, "tolerance_flow_pct"),
        tolerance_spc_pct=_fs(s, "tolerance_spc_pct"),
    )


# ── Full summary ─────────────────────────────────────────────────────────────

@router.get("/summary", response_model=KPISummary, summary="All KPIs in one response")
def kpi_summary(phase: Optional[str] = Query(None, description="Filter by phase")):
    """
    Returns min/max/mean/std for every KPI group.
    Optionally filter to a single phase.
    """
    return KPISummary(
        phase_filter=phase,
        thermal=_thermal(phase),
        pressure_flow=_pressure_flow(phase),
        electrical=_electrical(phase),
        spc=_spc(phase),
    )


# ── Individual KPI groups ─────────────────────────────────────────────────────

@router.get("/thermal", response_model=ThermalKPIs, summary="Thermal KPIs (6 temperature channels)")
def kpi_thermal(phase: Optional[str] = Query(None)):
    return _thermal(phase)


@router.get("/pressure-flow", response_model=PressureFlowKPIs, summary="Pressure & flow KPIs")
def kpi_pressure_flow(phase: Optional[str] = Query(None)):
    return _pressure_flow(phase)


@router.get("/electrical", response_model=ElectricalKPIs, summary="Electrical KPIs (motor, voltage, current, PF)")
def kpi_electrical(phase: Optional[str] = Query(None)):
    return _electrical(phase)


@router.get("/spc", response_model=SPCKPIs, summary="SPC & test tolerance KPIs")
def kpi_spc(phase: Optional[str] = Query(None)):
    return _spc(phase)
