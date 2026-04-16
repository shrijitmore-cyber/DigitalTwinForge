/* Indi4 theme — white surface, green accents */
import MLInsights from './MLInsights';

const T = {
  panel:   { flexShrink: 0, background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%' },
  section: { borderBottom: '1px solid #EEF2F0', padding: '12px 16px' },
  sHead:   { fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#00A651', marginBottom: '8px', fontFamily: "'IBM Plex Mono', monospace" },
  row:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F4F7F5' },
  label:   { fontSize: '12px', color: '#4A6B55', fontFamily: "'IBM Plex Sans', sans-serif" },
  unit:    { fontSize: '10px', color: '#9BB5A5', marginLeft: '3px', fontFamily: "'IBM Plex Mono', monospace" },
}

const STATUS_COLOR = {
  hot:   '#E53E00',
  warm:  '#D97706',
  ok:    '#111827',
  warn:  '#CA8A04',
  alert: '#DC2626',
}

function Section({ title, children }) {
  return (
    <div style={T.section}>
      <div style={T.sHead}>{title}</div>
      {children}
    </div>
  )
}

function MetricRow({ label, value, unit, status }) {
  const color = STATUS_COLOR[status] ?? '#111827'
  return (
    <div style={T.row}>
      <span style={T.label}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color, fontWeight: 600 }}>
        {value ?? '--'}
        {unit && <span style={T.unit}>{unit}</span>}
      </span>
    </div>
  )
}

function TolRow({ label, value, unit, pass }) {
  const fmt = v => v == null ? '--' : `${v > 0 ? '+' : ''}${v.toFixed(1)}${unit}`
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 8px', borderRadius: '4px', marginBottom: '4px',
      background: pass ? 'rgba(0,166,81,0.04)' : 'rgba(220,38,38,0.04)',
      border: `1px solid ${pass ? 'rgba(0,166,81,0.15)' : 'rgba(220,38,38,0.15)'}`,
    }}>
      <span style={{ fontSize: '12px', color: '#4A6B55', fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px',
          color: pass ? '#00A651' : '#DC2626', fontWeight: 600,
        }}>
          {fmt(value)}
        </span>
        <span style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
          padding: '2px 8px', borderRadius: '2px',
          fontFamily: "'IBM Plex Mono', monospace",
          background: pass ? '#00A651' : '#DC2626',
          color: '#FFFFFF',
        }}>
          {pass ? 'PASS' : 'FAIL'}
        </span>
      </div>
    </div>
  )
}

const f1 = v => v == null ? null : v.toFixed(1)
const f2 = v => v == null ? null : v.toFixed(2)
const f0 = v => v == null ? null : Math.round(v).toString()

export default function RightPanel({ frame, hideInference = false }) {
  const row = frame?.row ?? {}
  const h   = frame?.health?.alerts ?? []
  const d   = frame?.display ?? {}

  const alertStatus = field => h.find(a => a.field === field)?.status ?? 'ok'

  return (
    <aside style={T.panel}>
      {!hideInference && <MLInsights ml={frame?.ml} />}
      <Section title="Thermal">
        <MetricRow label="Airend Discharge"    value={f1(row.airend_discharge_temp_c)}   unit="°C"     status={alertStatus('airend_discharge_temp_c')} />
        <MetricRow label="Oil Cooler Inlet"    value={f1(row.oil_cooler_inlet_temp_c)}   unit="°C"     status={alertStatus('oil_cooler_inlet_temp_c')} />
        <MetricRow label="Oil Cooler Outlet"   value={f1(row.oil_cooler_outlet_temp_c)}  unit="°C"     status={alertStatus('oil_cooler_outlet_temp_c')} />
        <MetricRow label="After Cooler Inlet"  value={f1(row.aftercooler_inlet_temp_c)}  unit="°C"     status={alertStatus('aftercooler_inlet_temp_c')} />
        <MetricRow label="After Cooler Outlet" value={f1(row.aftercooler_outlet_temp_c)} unit="°C"     status={alertStatus('aftercooler_outlet_temp_c')} />
        <MetricRow label="Air Inlet"           value={f1(row.air_inlet_temp_c)}          unit="°C"     status="ok" />
      </Section>

      <Section title="Pressure & Flow">
        <MetricRow label="Delivery Pressure"   value={f2(row.delivery_pressure_kg_cm2g)}       unit="kg/cm²"  status={alertStatus('delivery_pressure_kg_cm2g')} />
        <MetricRow label="AOS Tank"            value={f2(row.aos_tank_inlet_pressure_kg_cm2g)} unit="kg/cm²"  status="ok" />
        <MetricRow label="FAD"                 value={f1(row.fad_cfm)}                         unit="CFM"     status={alertStatus('fad_cfm')} />
      </Section>

      <Section title="Electrical">
        <MetricRow label="Motor Output"   value={f1(row.motor_output_power_kw)}                                 unit="kW"  status="ok" />
        <MetricRow label="Package Input"  value={f1(row.package_input_power_kw)}                                unit="kW"  status="ok" />
        <MetricRow label="Voltage"        value={f0(row.input_voltage_v)}                                       unit="V"   status={alertStatus('input_voltage_v')} />
        <MetricRow label="Current"        value={f1(row.current_package_input_a)}                               unit="A"   status="ok" />
        <MetricRow label="Power Factor"   value={row.power_factor != null ? row.power_factor.toFixed(2) : null} status="ok" />
      </Section>

      <Section title="Test Tolerance">
        <TolRow label="Flow Tolerance" value={row.tolerance_flow_pct} unit="%" pass={d.tol_flow_pass} />
        <TolRow label="SPC Tolerance"  value={row.tolerance_spc_pct}  unit="%" pass={d.tol_spc_pass} />
      </Section>

      <Section title="SPC">
        <MetricRow label="Actual SPC" value={f1(row.spc_kw_per_m3_min)} unit="kW/m³/min" status="ok" />
      </Section>
    </aside>
  )
}
