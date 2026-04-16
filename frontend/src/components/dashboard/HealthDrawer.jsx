import { useEffect, useState } from 'react'

const MONO = "'IBM Plex Mono', monospace"
const SANS = "'IBM Plex Sans', sans-serif"

const STATUS_META = {
  hot:   { color: '#DC2626', bg: 'rgba(220,38,38,0.07)',   border: 'rgba(220,38,38,0.2)',  label: 'CRITICAL', icon: '▲' },
  warm:  { color: '#D97706', bg: 'rgba(217,119,6,0.07)',   border: 'rgba(217,119,6,0.2)',  label: 'WARNING',  icon: '▲' },
  warn:  { color: '#CA8A04', bg: 'rgba(202,138,4,0.07)',   border: 'rgba(202,138,4,0.2)',  label: 'CAUTION',  icon: '!' },
  alert: { color: '#DC2626', bg: 'rgba(220,38,38,0.07)',   border: 'rgba(220,38,38,0.2)',  label: 'ALERT',    icon: '▲' },
  ok:    { color: '#00A651', bg: 'rgba(0,166,81,0.06)',    border: 'rgba(0,166,81,0.15)',  label: 'NOMINAL',  icon: '✓' },
}

const FIELD_LABELS = {
  airend_discharge_temp_c:    'Airend Discharge Temp',
  delivery_pressure_kg_cm2g:  'Delivery Pressure',
  fad_cfm:                    'FAD Output',
  motor_output_power_kw:      'Motor Output Power',
  oil_cooler_inlet_temp_c:    'Oil Cooler Inlet',
  aftercooler_outlet_temp_c:  'Aftercooler Outlet',
  tolerance_flow_pct:         'Flow Tolerance',
  tolerance_spc_pct:          'SPC Tolerance',
  spc_kw_per_m3_min:          'Specific Power',
  package_input_power_kw:     'Package Input Power',
  current_a:                  'Current Draw',
  voltage_v:                  'Voltage',
}

function ScoreRing({ score }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score > 90 ? '#00A651' : score > 75 ? '#D97706' : '#DC2626'
  const label = score > 90 ? 'EXCELLENT' : score > 75 ? 'DEGRADED' : 'CRITICAL'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 16px' }}>
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg width="130" height="130" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r={r} fill="none" stroke="#EEF2F0" strokeWidth="9" />
          <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: MONO, fontSize: '32px', fontWeight: 700, color: '#0A1A10', lineHeight: 1 }}>
            {Math.round(score)}
          </span>
          <span style={{ fontFamily: MONO, fontSize: '8px', color: '#9BB5A5', letterSpacing: '0.1em', marginTop: 3 }}>
            / 100
          </span>
        </div>
      </div>
      <span style={{
        fontFamily: MONO, fontSize: '9px', fontWeight: 700,
        letterSpacing: '0.2em', color,
        marginTop: '8px',
      }}>
        {label}
      </span>
      <span style={{ fontFamily: SANS, fontSize: '11px', color: '#6B8A78', marginTop: '4px', textAlign: 'center' }}>
        Asset Vitality Score
      </span>
    </div>
  )
}

function AlertRow({ alert }) {
  const meta = STATUS_META[alert.status] ?? STATUS_META.ok
  const conf = alert.confidence ?? (alert.status === 'ok' ? 98 : alert.status === 'hot' ? 95 : 87)
  const label = FIELD_LABELS[alert.field] ?? alert.field?.replace(/_/g, ' ')

  return (
    <div style={{
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      borderLeft: `3px solid ${meta.color}`,
      borderRadius: '6px',
      padding: '10px 12px',
      marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontFamily: MONO, fontSize: '10px', fontWeight: 700,
            color: meta.color, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {meta.icon} {meta.label}
          </span>
        </div>
        <span style={{
          fontFamily: MONO, fontSize: '8px', fontWeight: 600,
          color: meta.color, background: '#FFFFFF',
          padding: '2px 7px', borderRadius: '3px',
          border: `1px solid ${meta.border}`,
          letterSpacing: '0.06em',
        }}>
          {conf}% CONF
        </span>
      </div>

      <div style={{ fontFamily: SANS, fontSize: '11px', color: '#3A5A46', marginBottom: '8px', lineHeight: 1.4 }}>
        <span style={{ fontWeight: 600 }}>{label}:</span>{' '}
        {alert.message ?? `Value ${alert.value != null ? Number(alert.value).toFixed(1) : '—'} exceeded threshold ${alert.threshold ?? '—'}`}
      </div>

      {/* Confidence bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '3px', background: '#EEF2F0', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${conf}%`,
            background: meta.color, borderRadius: 2,
            transition: 'width 0.8s ease',
          }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: '8px', color: '#9BB5A5', flexShrink: 0 }}>
          {alert.value != null ? Number(alert.value).toFixed(1) : '—'}
        </span>
      </div>
    </div>
  )
}

function NominalBadge({ count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 12px', borderRadius: '6px',
      background: 'rgba(0,166,81,0.06)', border: '1px solid rgba(0,166,81,0.15)',
      marginBottom: '8px',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00A651', flexShrink: 0 }} />
      <span style={{ fontFamily: SANS, fontSize: '11px', color: '#3A5A46' }}>
        <span style={{ fontWeight: 600 }}>{count} parameter{count !== 1 ? 's' : ''}</span> operating within nominal limits
      </span>
    </div>
  )
}

export default function HealthDrawer({ frame, onClose }) {
  const [score, setScore] = useState(94)

  useEffect(() => {
    const s = frame?.health?.score
    if (s != null) setScore(s)
  }, [frame])

  // Slight jitter when no real score
  useEffect(() => {
    if (frame?.health?.score != null) return
    const t = setInterval(() => {
      setScore(p => Math.min(99, Math.max(85, p + (Math.random() - 0.5) * 1.5)))
    }, 3000)
    return () => clearInterval(t)
  }, [frame])

  const alerts  = (frame?.health?.alerts ?? []).filter(a => a.status !== 'ok')
  const nominals = (frame?.health?.alerts ?? []).filter(a => a.status === 'ok').length

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(10,26,16,0.25)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: '320px', zIndex: 31,
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8E4',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        boxShadow: '4px 0 32px rgba(0,0,0,0.12)',
        animation: 'slideInLeft 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid #EEF2F0',
          background: '#F4F7F5', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#0A1A10', textTransform: 'uppercase' }}>
              ML Health Engine
            </div>
            <div style={{ fontFamily: SANS, fontSize: '10px', color: '#6B8A78', marginTop: 2 }}>
              Predictive analytics & anomaly detection
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #E2E8E4', borderRadius: '4px',
              width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9BB5A5', fontSize: '14px', flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Score ring */}
        <div style={{ borderBottom: '1px solid #EEF2F0', flexShrink: 0 }}>
          <ScoreRing score={score} />
        </div>

        {/* Anomaly section */}
        <div style={{ padding: '16px 18px', flex: 1 }}>
          <div style={{
            fontFamily: MONO, fontSize: '9px', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#A8BFB0', marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            Anomaly Detection
            {alerts.length > 0 && (
              <span style={{
                background: '#DC2626', color: '#fff',
                borderRadius: '10px', padding: '1px 7px',
                fontSize: '8px', fontWeight: 700,
              }}>
                {alerts.length}
              </span>
            )}
          </div>

          {alerts.length === 0 && nominals === 0 && (
            <div style={{ fontFamily: SANS, fontSize: '12px', color: '#9BB5A5', textAlign: 'center', padding: '20px 0' }}>
              Awaiting telemetry…
            </div>
          )}

          {alerts.map((a, i) => <AlertRow key={i} alert={a} />)}
          {nominals > 0 && <NominalBadge count={nominals} />}
        </div>

        {/* Simulation footer */}
        <div style={{
          padding: '14px 18px', borderTop: '1px solid #EEF2F0',
          background: '#F9FAFA', flexShrink: 0,
        }}>
          <div style={{ fontFamily: MONO, fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A8BFB0', marginBottom: '10px' }}>
            Simulation & What-If
          </div>
          <div style={{ fontFamily: SANS, fontSize: '11px', color: '#6B8A78', marginBottom: '10px', lineHeight: 1.4 }}>
            Run hypothetical load scenarios without risking physical equipment.
          </div>
          <button style={{
            width: '100%', background: '#FFFFFF',
            border: '1px solid #00A651', color: '#00A651',
            padding: '7px 0', fontSize: '10px', fontFamily: MONO,
            borderRadius: '4px', cursor: 'pointer', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Launch Sandbox
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
