import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MONO = "'IBM Plex Mono', monospace"
const SANS = "'IBM Plex Sans', sans-serif"

// ── Data — 6 units (2 columns × 3 rows in the isometric image) ───────────────
const BEDS = [
  {
    id: 'KES-A', label: 'Unit A', model: 'KES 22-8.5', serial: 'KES22-2A01',
    status: 'running', health: 94,
    pressure: '7.8 kg/cm²g', temp: '81.4°C', fad: '109 CFM',
    power: '18.4 kW', spc: '9.6 kW/m³min', uptime: '97.6%', alerts: 0,
    hours: 4820, lastService: '10 Mar 2026', phase: 'RATED RUN',
  },
  {
    id: 'KES-B', label: 'Unit B', model: 'KES 22-8.5', serial: 'KES22-2B01',
    status: 'warning', health: 72,
    pressure: '7.1 kg/cm²g', temp: '91.2°C', fad: '97 CFM',
    power: '19.8 kW', spc: '11.2 kW/m³min', uptime: '94.3%', alerts: 3,
    hours: 6210, lastService: '15 Dec 2025', phase: 'RATED RUN',
  },
  {
    id: 'KES-C', label: 'Unit C', model: 'KES 22-8.5', serial: 'KES22-2C01',
    status: 'running', health: 91,
    pressure: '8.1 kg/cm²g', temp: '78.6°C', fad: '118 CFM',
    power: '17.6 kW', spc: '9.0 kW/m³min', uptime: '99.1%', alerts: 0,
    hours: 3120, lastService: '05 Mar 2026', phase: 'RATED RUN',
  },
  {
    id: 'KES-D', label: 'Unit D', model: 'KES 22-8.5', serial: 'KES22-2D01',
    status: 'idle', health: 99,
    pressure: '—', temp: '34.1°C', fad: '0 CFM',
    power: '0.4 kW', spc: '—', uptime: '100%', alerts: 0,
    hours: 2140, lastService: '28 Jan 2026', phase: 'STANDBY',
  },
  {
    id: 'KES-E', label: 'Unit E', model: 'KES 22-8.5', serial: 'KES22-2E01',
    status: 'running', health: 88,
    pressure: '8.0 kg/cm²g', temp: '79.3°C', fad: '115 CFM',
    power: '17.9 kW', spc: '9.1 kW/m³min', uptime: '98.1%', alerts: 1,
    hours: 3680, lastService: '20 Feb 2026', phase: 'RATED RUN',
  },
]

const CFG = {
  running: { color: '#00A651', label: 'RUNNING', pulse: true  },
  warning: { color: '#D97706', label: 'WARNING', pulse: true  },
  idle:    { color: '#0EA5E9', label: 'STANDBY', pulse: false },
  offline: { color: '#9BB5A5', label: 'OFFLINE', pulse: false },
}

// ── Positions inside the 1536×1024 image (% of image container) ──────────────
//
//  The image has 6 machines in a 2-column × 3-row isometric layout:
//
//   Row 0 (back/top)    :  A (left)  |  B (right)    ← smaller, further away
//   Row 1 (middle)      :  C (left)  |  D (right)
//   Row 2 (front/bottom):  E (left)  |  F (right)    ← larger, closer
//
//  PULSE_POS → pulsing ring at each machine's motor body centre
//  ZONES     → invisible clickable quad over each machine

const PULSE_POS = [
  { id: 'KES-A', left: '23%',  top: '32%'  },
  { id: 'KES-B', left: '40%',  top: '15%'  },
  { id: 'KES-C', left: '40%',  top: '48%'  },
  { id: 'KES-D', left: '80%',  top: '50%'  },
  { id: 'KES-E', left: '60%',  top: '36%'  },
]

const ZONES = [
  { id: 'KES-A', left: '15%',  top: '25%',  width: '18%', height: '20%' },
  { id: 'KES-B', left: '32%',  top: '5%',   width: '18%', height: '20%' },
  { id: 'KES-C', left: '32%',  top: '40%',  width: '18%', height: '20%' },
  { id: 'KES-D', left: '70%',  top: '40%',  width: '20%', height: '20%' },
  { id: 'KES-E', left: '50%',  top: '25%',  width: '20%', height: '20%' },
]

// ── HMI label chip — sits on the machine's control panel ─────────────────────
function HmiChip({ bed, pos, selected, hovered, onClick }) {
  const c   = CFG[bed.status]
  const sel = selected?.id === bed.id
  const hov = hovered?.id === bed.id
  const hc  = bed.health > 90 ? '#00A651' : bed.health > 70 ? '#D97706' : '#DC2626'

  // Smart flip: Only for units in the very back (top < 20%)
  const topVal = parseInt(pos.top) || 0
  const isTop  = topVal < 20
  
  // Final top position: Pulse ring centre + padding
  const topPx  = isTop ? '12px' : '-12px'
  const trans  = isTop ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100%)'

  return (
    <div
      onClick={() => bed.status !== 'offline' && onClick(bed)}
      style={{
        position: 'absolute', 
        left: pos.left, 
        top: `calc(${pos.top} + ${topPx})`,
        zIndex: 110,
        transform: trans,
        cursor: bed.status !== 'offline' ? 'pointer' : 'default',
        pointerEvents: hov ? 'none' : 'auto', 
      }}
    >
      <div style={{ animation: isTop ? 'cb_fadeDown 0.25s ease-out' : 'cb_fadeUp 0.25s ease-out' }}>
        {/* Connector tick up (if on top) */}
        {isTop && (
          <div style={{
            width: 1, height: 4,
            background: `linear-gradient(transparent, ${c.color})`,
            margin: '0 auto',
            opacity: 0.9,
          }}/>
        )}

        <div style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(226, 232, 228, 0.8)',
          borderLeft: `3px solid ${c.color}`,
          borderRadius: 4,
          padding: '6px 10px 6px 9px',
          boxShadow: sel
            ? `0 12px 28px rgba(0,0,0,0.18), 0 0 0 2px ${c.color}35`
            : '0 4px 15px rgba(0,0,0,0.12)',
          minWidth: 108,
          transition: 'all 0.2s',
        }}>
          {/* Unit name + live dot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#0A1A10', letterSpacing: '0.04em' }}>
              {bed.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%', background: c.color,
                animation: c.pulse ? 'cb_dot 1.4s ease-in-out infinite' : 'none',
              }}/>
              <span style={{ fontFamily: MONO, fontSize: 8, color: c.color, fontWeight: 700, letterSpacing: '0.1em' }}>
                {c.label}
              </span>
            </div>
          </div>

          {/* Health bar */}
          {bed.health > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: MONO, fontSize: 7, color: '#9BB5A5', letterSpacing: '0.1em' }}>HEALTH</span>
                <span style={{ fontFamily: MONO, fontSize: 7, color: hc, fontWeight: 700 }}>{bed.health}%</span>
              </div>
              <div style={{ height: 3, background: '#EEF2F0', borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
                <div style={{
                  height: '100%', width: `${bed.health}%`,
                  background: hc, borderRadius: 2, transition: 'width 1s ease',
                }}/>
              </div>
            </>
          )}

          {/* Pressure quick-stat */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: MONO, fontSize: 7, color: '#9BB5A5', letterSpacing: '0.08em' }}>PRESS</span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: '#0A1A10', fontWeight: 700 }}>{bed.pressure}</span>
          </div>

          {/* Alert */}
          {bed.alerts > 0 && (
            <div style={{
              marginTop: 5, display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 6px',
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 3,
            }}>
              <span style={{ fontSize: 8, color: '#DC2626', animation: 'cb_dot 1s step-end infinite' }}>●</span>
              <span style={{ fontFamily: MONO, fontSize: 8, color: '#DC2626' }}>
                {bed.alerts} alert{bed.alerts > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Connector tick down toward the machine (if not on top) */}
        {!isTop && (
          <div style={{
            width: 1, height: 4,
            background: `linear-gradient(${c.color}, transparent)`,
            margin: '0 auto',
            opacity: 0.9,
          }}/>
        )}
      </div>
    </div>
  )
}

// ── Invisible click zone + selection corner brackets ─────────────────────────
function ClickZone({ bed, zone, selected, onClick, onHover }) {
  const c   = CFG[bed.status]
  const sel = selected?.id === bed.id
  const can = bed.status !== 'offline'

  return (
    <div
      onClick={() => can && onClick(bed)}
      onMouseEnter={() => can && onHover(bed)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: 'absolute',
        left: zone.left, top: zone.top,
        width: zone.width, height: zone.height,
        cursor: can ? 'pointer' : 'default',
        zIndex: 50,
        background: 'transparent',
        transition: 'background 0.2s',
      }}
    >
      {/* No squares as requested */}
    </div>
  )
}

// ── Animated pulse ring at machine motor centre ───────────────────────────────
function PulseRing({ bed, pos, onClick, onHover }) {
  const c = CFG[bed.status]
  if (bed.status === 'offline') return null
  const can = bed.status !== 'offline'

  return (
    <div 
      onClick={() => can && onClick(bed)}
      onMouseEnter={() => can && onHover(bed)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: 'absolute', left: pos.left, top: pos.top,
        transform: 'translate(-50%,-50%)',
        width: 48, height: 48, // Large enough to hover easily
        zIndex: 60, 
        cursor: can ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Outer expanding ring */}
      <div style={{
        position: 'absolute', width: 48, height: 48, left: -24, top: -24,
        borderRadius: '50%', border: `1.5px solid ${c.color}`,
        opacity: 0,
        animation: c.pulse
          ? 'cb_ring 2.2s ease-out infinite'
          : 'cb_ringIdle 4s ease-out infinite',
      }}/>
      {/* Second ring, offset */}
      {c.pulse && (
        <div style={{
          position: 'absolute', width: 30, height: 30, left: -15, top: -15,
          borderRadius: '50%', border: `1.5px solid ${c.color}`,
          opacity: 0,
          animation: 'cb_ring 2.2s ease-out 0.9s infinite',
        }}/>
      )}
      {/* Core dot */}
      <div style={{
        position: 'absolute', width: 8, height: 8, left: -4, top: -4,
        borderRadius: '50%', background: c.color,
        boxShadow: `0 0 10px ${c.color}, 0 0 4px ${c.color}`,
        animation: c.pulse ? 'cb_dot 1.4s ease-in-out infinite' : 'none',
      }}/>
    </div>
  )
}

// ── Fleet bar – white card matching FacilityMap ───────────────────────────────
function FleetBar({ beds }) {
  const live      = beds.filter(b => b.health > 0)
  const running   = beds.filter(b => b.status === 'running').length
  const warning   = beds.filter(b => b.status === 'warning').length
  const avgHealth = live.length
    ? Math.round(live.reduce((s, b) => s + b.health, 0) / live.length) : 0
  const alerts    = beds.reduce((s, b) => s + b.alerts, 0)

  const cols = [
    { val: `${running} / ${beds.length}`, label: `UNITS ACTIVE`,  color: '#00A651', icon: 'factory'        },
    { val: `${avgHealth}%`,               label: 'AVG HEALTH',    color: avgHealth > 85 ? '#00A651' : '#D97706', icon: 'monitor_heart' },
    { val: alerts || '—',                 label: 'ACTIVE ALERTS', color: alerts ? '#DC2626' : '#9BB5A5',    icon: 'notifications' },
    { val: warning || '—',               label: 'WARNINGS',      color: warning ? '#D97706' : '#9BB5A5',   icon: 'warning'       },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: 5,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {cols.map((col, i) => (
        <div key={col.label} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && <div style={{ width: 1, background: '#E2E8E4', alignSelf: 'stretch' }}/>}
          <div style={{ padding: '8px 20px', textAlign: 'center', minWidth: 110 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, color: col.color }}>{col.icon}</span>
              <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 800, color: col.color, lineHeight: 1 }}>
                {col.val}
              </span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: '#9BB5A5', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {col.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Detail panel – white, FacilityMap StatsCard style ────────────────────────
function DetailPanel({ bed, onClose, onLaunch }) {
  const c    = CFG[bed.status]
  const hc   = bed.health > 90 ? '#00A651' : bed.health > 70 ? '#D97706' : '#DC2626'
  const r    = 24
  const circ = 2 * Math.PI * r

  return (
    <div style={{
      width: 272, flexShrink: 0,
      background: '#FFFFFF',
      border: '1px solid #E2E8E4',
      borderLeft: `3px solid ${c.color}`,
      borderRadius: 6,
      boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
      fontFamily: MONO,
      display: 'flex', flexDirection: 'column',
      animation: 'cb_slideIn 0.18s cubic-bezier(0.4,0,0.2,1)',
      maxHeight: '100%', overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{
        padding: '13px 14px 11px',
        borderBottom: '1px solid #EEF2F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        background: '#F4F7F5', borderRadius: '3px 3px 0 0',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0A1A10', letterSpacing: '0.02em', marginBottom: 2 }}>
            {bed.label}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: '#6B8075' }}>
            {bed.id} · {bed.model}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: 3,
          width: 28, height: 28, cursor: 'pointer', color: '#9BB5A5',
          fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.color='#DC2626'; e.currentTarget.style.borderColor='rgba(220,38,38,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background='#FFFFFF'; e.currentTarget.style.color='#9BB5A5'; e.currentTarget.style.borderColor='#E2E8E4' }}
        >✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Status */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #EEF2F0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px',
            background: c.color + '12', border: `1px solid ${c.color}30`,
            borderRadius: 4,
          }}>
            {c.pulse && <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, animation: 'cb_dot 1.4s ease-in-out infinite' }}/>}
            <span style={{ fontSize: 11, color: c.color, fontWeight: 700, letterSpacing: '0.14em' }}>{c.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9BB5A5' }}>{bed.phase}</span>
          </div>
        </div>

        {/* Health ring */}
        {bed.health > 0 && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
              <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="28" cy="28" r={r} fill="none" stroke="#EEF2F0" strokeWidth="4.5"/>
                <circle cx="28" cy="28" r={r} fill="none" stroke={hc} strokeWidth="4.5"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - bed.health / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: hc,
              }}>{bed.health}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#9BB5A5', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
                Asset Health Index
              </div>
              <div style={{ height: 4, background: '#EEF2F0', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${bed.health}%`, background: hc, borderRadius: 2, transition: 'width 1s ease' }}/>
              </div>
              <div style={{ fontSize: 10, color: '#9BB5A5' }}>Uptime {bed.uptime}</div>
            </div>
          </div>
        )}

        {/* Live parameters */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #EEF2F0', background: '#FAFBFA' }}>
          <div style={{ fontSize: 9, color: '#00A651', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>monitoring</span>
            Live Parameters
          </div>
          {[
            { label: 'Delivery Pressure', value: bed.pressure, icon: 'compress'   },
            { label: 'Airend Temp',        value: bed.temp,     icon: 'thermostat' },
            { label: 'FAD',                value: bed.fad,      icon: 'air'        },
            { label: 'Motor Power',        value: bed.power,    icon: 'bolt'       },
            { label: 'SPC',                value: bed.spc,      icon: 'speed'      },
          ].map(m => (
            <div key={m.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 8px', marginBottom: 4,
              background: '#FFFFFF', borderRadius: 3, border: '1px solid #EEF2F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#9BB5A5' }}>{m.icon}</span>
                <span style={{ fontSize: 10, color: '#6B8075' }}>{m.label}</span>
              </div>
              <span style={{ fontSize: 11, color: '#0A1A10', fontWeight: 700 }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Service */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #EEF2F0' }}>
          {[
            { l: 'Last service', v: bed.lastService },
            { l: 'Total hours',  v: `${bed.hours.toLocaleString()} h` },
            { l: 'Serial',       v: bed.serial },
          ].map(row => (
            <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
              <span style={{ color: '#9BB5A5' }}>{row.l}</span>
              <span style={{ color: '#0A1A10', fontWeight: 700 }}>{row.v}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {bed.alerts > 0 && (
          <div style={{ margin: '10px 14px', padding: '7px 10px', background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#DC2626', animation: 'cb_dot 1s step-end infinite' }}>●</span>
            <span style={{ fontSize: 11, color: '#DC2626', letterSpacing: '0.06em' }}>
              {bed.alerts} active alert{bed.alerts > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Launch */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #EEF2F0', flexShrink: 0 }}>
        <button onClick={onLaunch} style={{
          width: '100%', padding: '9px',
          background: '#00A651', color: '#FFFFFF',
          border: 'none', cursor: 'pointer',
          fontFamily: MONO, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#008C44'}
          onMouseLeave={e => e.currentTarget.style.background = '#00A651'}
        >
          Launch Digital Twin →
        </button>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CompressorBed() {
  const navigate        = useNavigate()
  const { user, logout } = useAuth()
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered]   = useState(null)
  const [clock, setClock]       = useState('')

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000)
    return () => clearInterval(t)
  }, [])

  function handleSelect(bed) {
    setSelected(s => s?.id === bed.id ? null : bed)
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: '#F4F7F5',   // ← same as FacilityMap leaflet background
      }}>

        {/* ── Header – identical to FacilityMap ── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '0 24px', height: '64px', flexShrink: 0,
          background: '#FFFFFF', borderBottom: '1px solid #E2E8E4',
          fontFamily: MONO, zIndex: 100,
        }}>
          <span
            style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.05em', cursor: 'pointer' }}
            onClick={() => navigate('/map')}
          >INDI4</span>

          <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>

          <span
            style={{ fontFamily: SANS, fontSize: '13px', color: '#6B8075', cursor: 'pointer', transition: 'color 0.15s' }}
            onClick={() => navigate('/map')}
            onMouseEnter={e => e.target.style.color = '#0A1A10'}
            onMouseLeave={e => e.target.style.color = '#6B8075'}
          >Facility Map</span>
          <span style={{ fontFamily: SANS, fontSize: '13px', color: '#CBD5D0' }}>›</span>
          <span style={{ fontFamily: SANS, fontSize: '13px', color: '#111827', fontWeight: 600 }}>
            Compressor Bed
          </span>

          <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>

          {BEDS.filter(b => b.status === 'running').length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 4,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00A651', animation: 'cb_dot 1.4s ease-in-out infinite' }}/>
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#00A651', fontWeight: 700, letterSpacing: '0.12em' }}>
                {BEDS.filter(b => b.status === 'running').length} RUNNING
              </span>
            </div>
          )}
          {BEDS.filter(b => b.status === 'warning').length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
              background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 4,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97706', animation: 'cb_dot 1.4s ease-in-out infinite' }}/>
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#D97706', fontWeight: 700, letterSpacing: '0.12em' }}>
                {BEDS.filter(b => b.status === 'warning').length} WARNING
              </span>
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00A651', boxShadow: '0 0 8px rgba(0,166,81,0.6)', animation: 'cb_dot 1.5s ease-in-out infinite' }}/>
              <span style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '2px', color: '#00A651', fontWeight: 700, textTransform: 'uppercase' }}>LIVE</span>
            </div>
            <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>
            <span style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '0.05em' }}>{clock}</span>
            <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>
            <span style={{ fontFamily: SANS, fontSize: '13px', color: '#6B8075' }}>{user?.username ?? 'admin'}</span>
            <button
              onClick={() => { logout(); navigate('/login') }}
              style={{ fontFamily: MONO, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: '#AAB5AD', transition: 'color 0.2s', padding: 0 }}
              onMouseEnter={e => e.target.style.color = '#E53E3E'}
              onMouseLeave={e => e.target.style.color = '#AAB5AD'}
            >Sign out</button>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', gap: 16, padding: '16px 20px', overflow: 'hidden', alignItems: 'flex-start' }}>

          {/* Left: fleet bar + image */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', minWidth: 0 }}>

            {/* Fleet summary bar – sits above the image */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <FleetBar beds={BEDS}/>
            </div>

            {/* Image container – relative, so overlays use % within it */}
            <div style={{
              flex: 1,
              position: 'relative',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(11, 18, 34, 0.5), 0 1px 4px rgba(0,0,0,0.1)',
              border: '1px solid #D1D9D3',
              background: '#0B1222',  // Brand-aligned deep navy theme
            }}>
              {/* The actual image */}
              <img
                src="/Compressor bed.png"
                alt="Compressor Bed"
                draggable={false}
                style={{
                  width: '100%', height: '100%',
                  display: 'block',
                  objectFit: 'contain',
                  userSelect: 'none',
                }}
              />

              {/* Transparent click zones */}
              {BEDS.map((bed, i) => (
                <ClickZone 
                  key={bed.id} 
                  bed={bed} 
                  zone={ZONES[i]} 
                  selected={selected} 
                  onClick={handleSelect}
                  onHover={setHovered}
                />
              ))}

              {/* Pulse rings ON the machine bodies */}
              {BEDS.map((bed, i) => (
                <PulseRing 
                  key={bed.id} 
                  bed={bed} 
                  pos={PULSE_POS[i]}
                  onClick={handleSelect}
                  onHover={setHovered}
                />
              ))}

              {/* Tooltip Info chips (only visible on hover or select) */}
              {BEDS.map((bed, i) => {
                const isVisible = selected?.id === bed.id || hovered?.id === bed.id;
                if (!isVisible) return null;
                return (
                  <HmiChip 
                    key={bed.id} 
                    bed={bed} 
                    pos={PULSE_POS[i]} 
                    selected={selected} 
                    hovered={hovered}
                    onClick={handleSelect}
                  />
                );
              })}

              {/* Hint */}
              {!selected && (
                <div style={{
                  position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center',
                  fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  animation: 'cb_hint 2.5s ease-in-out infinite',
                  pointerEvents: 'none', zIndex: 5,
                }}>
                  Select a compressor unit to inspect
                </div>
              )}
            </div>
          </div>

          {/* Right: detail panel – appears beside the image, not on top */}
          {selected && (
            <div style={{ flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
              <DetailPanel
                bed={selected}
                onClose={() => setSelected(null)}
                onLaunch={() => navigate('/dashboard')}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700;800&family=IBM+Plex+Sans:wght@400;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes cb_dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.18; }
  }
  @keyframes cb_ring {
    0%   { transform: scale(0.3); opacity: 0.85; }
    100% { transform: scale(3);   opacity: 0; }
  }
  @keyframes cb_ringIdle {
    0%   { transform: scale(0.5); opacity: 0.5; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes cb_hint {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 1; }
  }
  @keyframes cb_fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cb_fadeDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cb_slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`
