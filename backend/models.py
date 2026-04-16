"""Pydantic response models for the KES 22-8.5 Digital Twin API."""

from typing import Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Machine metadata
# ---------------------------------------------------------------------------

class MachineInfo(BaseModel):
    model: str
    serial: str
    working_pressure_kg_cm2: float
    rated_fad_cfm: float
    motor_kw: float
    motor_rpm: int
    fan_kw: float
    fan_rpm: int
    description: str


# ---------------------------------------------------------------------------
# Time-series data row (matches Excel columns exactly)
# ---------------------------------------------------------------------------

class DataRow(BaseModel):
    idx: int
    timestamp: Optional[str]
    elapsed_time_min: Optional[float]
    elapsed_time_sec: Optional[int]
    phase: Optional[str]
    airend_discharge_temp_c: Optional[float]
    delivery_pressure_kg_cm2g: Optional[float]
    oil_cooler_inlet_temp_c: Optional[float]
    oil_cooler_outlet_temp_c: Optional[float]
    aftercooler_inlet_temp_c: Optional[float]
    aftercooler_outlet_temp_c: Optional[float]
    fad_cfm: Optional[float]
    motor_output_power_kw: Optional[float]
    package_input_power_kw: Optional[float]
    input_voltage_v: Optional[float]
    current_package_input_a: Optional[float]
    aos_tank_inlet_pressure_kg_cm2g: Optional[float]
    air_inlet_temp_c: Optional[float]
    power_factor: Optional[float]
    tolerance_flow_pct: Optional[float]
    spc_kw_per_m3_min: Optional[float]
    tolerance_spc_pct: Optional[float]


class DataPage(BaseModel):
    total: int
    skip: int
    limit: int
    phase_filter: Optional[str]
    rows: list[DataRow]


# ---------------------------------------------------------------------------
# KPI building blocks
# ---------------------------------------------------------------------------

class FieldStats(BaseModel):
    min: Optional[float]
    max: Optional[float]
    mean: Optional[float]
    std: Optional[float]
    count: int


class ThermalKPIs(BaseModel):
    airend_discharge_temp_c: FieldStats
    oil_cooler_inlet_temp_c: FieldStats
    oil_cooler_outlet_temp_c: FieldStats
    aftercooler_inlet_temp_c: FieldStats
    aftercooler_outlet_temp_c: FieldStats
    air_inlet_temp_c: FieldStats


class PressureFlowKPIs(BaseModel):
    delivery_pressure_kg_cm2g: FieldStats
    aos_tank_inlet_pressure_kg_cm2g: FieldStats
    fad_cfm: FieldStats


class ElectricalKPIs(BaseModel):
    motor_output_power_kw: FieldStats
    package_input_power_kw: FieldStats
    input_voltage_v: FieldStats
    current_package_input_a: FieldStats
    power_factor: FieldStats


class SPCKPIs(BaseModel):
    spc_kw_per_m3_min: FieldStats
    tolerance_flow_pct: FieldStats
    tolerance_spc_pct: FieldStats


class KPISummary(BaseModel):
    phase_filter: Optional[str]
    thermal: ThermalKPIs
    pressure_flow: PressureFlowKPIs
    electrical: ElectricalKPIs
    spc: SPCKPIs


# ---------------------------------------------------------------------------
# Phase summary
# ---------------------------------------------------------------------------

class PhaseSummary(BaseModel):
    phase: str
    row_count: int
    start_time: Optional[str]
    end_time: Optional[str]
    elapsed_start_sec: Optional[int]
    elapsed_end_sec: Optional[int]


# ---------------------------------------------------------------------------
# Trend (chart) data
# ---------------------------------------------------------------------------

class TrendSeries(BaseModel):
    labels: list[str]           # elapsed-time strings  e.g. "0:02:15"
    airend_discharge_temp_c: list[Optional[float]]
    fad_cfm: list[Optional[float]]
    motor_output_power_kw: list[Optional[float]]
    delivery_pressure_kg_cm2g: list[Optional[float]]
    package_input_power_kw: list[Optional[float]]


# ---------------------------------------------------------------------------
# Health / alert status
# ---------------------------------------------------------------------------

class AlertItem(BaseModel):
    field: str
    label: str
    value: Optional[float]
    unit: str
    status: str          # "ok" | "warn" | "hot" | "alert"
    message: Optional[str]


class HealthStatus(BaseModel):
    overall: str          # "ok" | "warn" | "alert"
    idx: int
    timestamp: Optional[str]
    phase: Optional[str]
    alerts: list[AlertItem]


# ---------------------------------------------------------------------------
# Upload response
# ---------------------------------------------------------------------------

class UploadResponse(BaseModel):
    status: str
    rows_loaded: int
    columns: list[str]
    phases: list[str]
