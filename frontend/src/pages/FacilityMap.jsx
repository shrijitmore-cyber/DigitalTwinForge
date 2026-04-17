import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext'
import 'leaflet/dist/leaflet.css'
import logo from '../assets/logo.png'

const MONO = "'IBM Plex Mono', monospace"
const SANS = "'IBM Plex Sans', sans-serif"

const STATUS = {
  running: { color: '#00A651', label: 'RUNNING', pulse: true  },
  warning: { color: '#D97706', label: 'WARNING', pulse: true  },
  idle:    { color: '#9BB5A5', label: 'STANDBY', pulse: false },
  offline: { color: '#CBD5D0', label: 'OFFLINE', pulse: false },
}

const CITIES = [
  { 
    id: 'SCR-DL-01', label: 'New Delhi',  model: 'KES 22-8.5', lat: 28.63,  lng: 77.22,  
    status: 'warning', health: 75, pressure: '7.4 kg/cm²', temp: '88.2°C', fad: '102 CFM', uptime: '95.3%', alerts: 3,
    fpy: 92.4, volume_curr: 112, volume_target: 135, cycle_time: '54m 05s', utilization: 78
  },
  { 
    id: 'SCR-MB-01', label: 'Mumbai',     model: 'KES 22-8.5', lat: 19.08,  lng: 72.88,  
    status: 'running', health: 88, pressure: '7.8 kg/cm²', temp: '81.4°C', fad: '109 CFM', uptime: '97.6%', alerts: 1,
    fpy: 96.5, volume_curr: 128, volume_target: 140, cycle_time: '45m 30s', utilization: 92
  },
  { 
    id: 'SCR-CH-01', label: 'Chennai',    model: 'KES 15-7.5', lat: 13.08,  lng: 80.27,  
    status: 'warning', health: 71, pressure: '7.2 kg/cm²', temp: '91.3°C', fad: '94 CFM',  uptime: '94.1%', alerts: 4,
    fpy: 91.2, volume_curr: 95, volume_target: 120, cycle_time: '58m 10s', utilization: 74
  },
  { 
    id: 'SCR-KL-01', label: 'Kolkata',    model: 'KES 30-10',  lat: 22.57,  lng: 88.36,  
    status: 'running', health: 99, pressure: '10.1 kg/cm²',temp: '74.5°C', fad: '147 CFM', uptime: '100%',  alerts: 0,
    fpy: 99.1, volume_curr: 155, volume_target: 155, cycle_time: '38m 45s', utilization: 96
  },
  { 
    id: 'SCR-BG-01', label: 'Bengaluru',  model: 'KES 22-8.5', lat: 12.97,  lng: 77.59,  
    status: 'running', health: 96, pressure: '8.2 kg/cm²', temp: '79.0°C', fad: '121 CFM', uptime: '98.8%', alerts: 0,
    fpy: 97.8, volume_curr: 134, volume_target: 140, cycle_time: '41m 20s', utilization: 85
  },
  { 
    id: 'SCR-HY-01', label: 'Hyderabad',  model: 'KES 15-7.5', lat: 17.38,  lng: 78.49,  
    status: 'idle',    health: 99, pressure: '—',           temp: '34.2°C', fad: '0 CFM',   uptime: '100%',  alerts: 0,
    fpy: 99.5, volume_curr: 0, volume_target: 110, cycle_time: '—', utilization: 0
  },
  { 
    id: 'SCR-PN-01', label: 'Pune',       model: 'KES 22-8.5', lat: 18.52,  lng: 73.86,  
    status: 'running', health: 94, pressure: '8.0 kg/cm²', temp: '77.1°C', fad: '118 CFM', uptime: '99.2%', alerts: 2,
    fpy: 98.2, volume_curr: 142, volume_target: 150, cycle_time: '42m 15s', utilization: 88
  },
  { 
    id: 'SCR-AH-01', label: 'Ahmedabad',  model: 'KES 30-10',  lat: 23.03,  lng: 72.59,  
    status: 'offline', health: 0,  pressure: '—',           temp: '—',       fad: '—',       uptime: '—',     alerts: 0,
    fpy: 0, volume_curr: 0, volume_target: 125, cycle_time: '—', utilization: 0
  },
]


// ── Custom Leaflet divIcon for each city ────────────────────────────────────
function makeIcon(city, isSelected) {
  const s    = STATUS[city.status]
  const size = isSelected ? 22 : 18
  const ring = isSelected ? `
    <circle cx="11" cy="11" r="16" fill="none" stroke="${s.color}" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.7"/>
  ` : ''
  const pulse = s.pulse && !isSelected ? `
    <circle cx="11" cy="11" r="14" fill="none" stroke="${s.color}" stroke-width="1" opacity="0">
      <animate attributeName="r" from="12" to="20" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="11" cy="11" r="18" fill="none" stroke="${s.color}" stroke-width="0.7" opacity="0">
      <animate attributeName="r" from="14" to="24" dur="2s" begin="0.7s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.3" to="0" dur="2s" begin="0.7s" repeatCount="indefinite"/>
    </circle>
  ` : ''
  const alertBadge = city.alerts > 0 ? `
    <circle cx="19" cy="3" r="5.5" fill="#DC2626" stroke="white" stroke-width="1.5"/>
    <text x="19" y="6.5" text-anchor="middle" font-family="monospace" font-size="5.5" font-weight="800" fill="white">${city.alerts}</text>
  ` : ''
  const shadow = isSelected
    ? `filter: drop-shadow(0 2px 10px ${s.color}90);`
    : `filter: drop-shadow(0 1px 4px rgba(0,0,0,0.18));`

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="44" viewBox="0 0 22 44" style="${shadow}">
      ${pulse}
      ${ring}
      <circle cx="11" cy="11" r="${size / 2 + 1}" fill="${isSelected ? s.color : '#FFFFFF'}" stroke="${s.color}" stroke-width="${isSelected ? 0 : 2}"/>
      <circle cx="11" cy="11" r="${isSelected ? 3.5 : 3}" fill="${isSelected ? '#fff' : s.color}"/>
      ${alertBadge}
      <!-- pin line -->
      <line x1="11" y1="21" x2="11" y2="38" stroke="${s.color}" stroke-width="1.5" opacity="0.5"/>
      <circle cx="11" cy="39" r="2" fill="${s.color}" opacity="0.4"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [22, 44],
    iconAnchor: [11, 39],
    popupAnchor:[0, -40],
  })
}

// ── Restrict map to India bounds ────────────────────────────────────────────
function MapBounds() {
  const map = useMap()
  useEffect(() => {
    map.setMaxBounds([[6, 66], [38, 98]])
    map.on('drag', () => map.panInsideBounds([[6, 66], [38, 98]], { animate: false }))
  }, [map])
  return null
}


// ── Stats card ──────────────────────────────────────────────────────────────
function StatsCard({ city, onLaunch, onClose }) {
  const s  = STATUS[city.status]
  const hc = city.health > 90 ? '#00A651' : city.health > 70 ? '#D97706' : '#DC2626'
  const r  = 24, circ = 2 * Math.PI * r

  return (
    <div style={{
      position: 'absolute', right: 24, top: '50%',
      transform: 'translateY(-50%)',
      width: 272, zIndex: 1000,
      background: '#FFFFFF',
      border: '1px solid #E2E8E4',
      borderLeft: `3px solid ${s.color}`,
      borderRadius: 6,
      boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
      fontFamily: MONO,
      animation: 'cardIn 0.18s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 14px 11px',
        borderBottom: '1px solid #EEF2F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        background: '#F4F7F5', borderRadius: '3px 3px 0 0',
      }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#0A1A10', letterSpacing: '0.02em', marginBottom: 2 }}>
            {city.label}
          </div>
          <div style={{ fontFamily: SANS, fontSize: '12px', color: '#6B8075' }}>
            {city.id} · {city.model}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: 3,
          width: 28, height: 28, cursor: 'pointer', color: '#9BB5A5',
          fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>✕</button>
      </div>

      {/* Health ring */}
      {city.health > 0 && (
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
            <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r={r} fill="none" stroke="#EEF2F0" strokeWidth="4.5"/>
              <circle cx="28" cy="28" r={r} fill="none" stroke={hc} strokeWidth="4.5"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - city.health / 100)}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: hc,
            }}>{city.health}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#9BB5A5', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
              Asset Health Index
            </div>
            <div style={{ height: 4, background: '#EEF2F0', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ height: '100%', width: `${city.health}%`, background: hc, borderRadius: 2, transition: 'width 1s ease' }}/>
            </div>
            <div style={{ fontSize: '10px', color: '#9BB5A5' }}>Uptime {city.uptime}</div>
          </div>
        </div>
      )}

      {/* Operational Intelligence (Exec KPIs) */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #EEF2F0', background: '#FAFBFA' }}>
        <div style={{ fontSize: '10px', color: '#00A651', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>insights</span>
          Operational Intelligence
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* FPY */}
          <div>
            <div style={{ fontSize: '9px', color: '#9BB5A5', letterSpacing: '0.08em', marginBottom: 4 }}>FIRST PASS YIELD</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: city.fpy > 95 ? '#00A651' : '#D97706' }}>{city.fpy}%</div>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: city.fpy > 95 ? '#00A651' : '#D97706' }} />
            </div>
          </div>
          
          {/* Volume */}
          <div>
            <div style={{ fontSize: '9px', color: '#9BB5A5', letterSpacing: '0.08em', marginBottom: 4 }}>DISPATCH VOLUME</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1A10' }}>
              {city.volume_curr} <span style={{ color: '#9BB5A5', fontWeight: 400, fontSize: '12px' }}>/ {city.volume_target}</span>
            </div>
            <div style={{ height: 4, background: '#EEF2F0', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(city.volume_curr / city.volume_target) * 100}%`, background: '#2563EB', transition: 'width 1s ease' }} />
            </div>
          </div>

          {/* Cycle Time */}
          <div>
            <div style={{ fontSize: '9px', color: '#9BB5A5', letterSpacing: '0.08em', marginBottom: 4 }}>AVG CYCLE TIME</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1A10', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#9BB5A5' }}>timer</span>
              {city.cycle_time}
            </div>
          </div>

          {/* Utilization */}
          <div>
            <div style={{ fontSize: '9px', color: '#9BB5A5', letterSpacing: '0.08em', marginBottom: 4 }}>BED UTILIZATION</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A1A10' }}>{city.utilization}%</div>
               <div style={{ flex: 1, height: 4, background: '#EEF2F0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${city.utilization}%`, background: city.utilization > 85 ? '#00A651' : '#D97706', transition: 'width 1s ease' }} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {city.alerts > 0 && (
        <div style={{
          margin: '10px 14px 0', padding: '7px 10px',
          background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: '9px', color: '#DC2626', animation: 'dotBlink 1s step-end infinite' }}>●</span>
          <span style={{ fontSize: '11px', color: '#DC2626', letterSpacing: '0.06em' }}>
            {city.alerts} active alert{city.alerts > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Launch */}
      <div style={{ padding: '12px 14px' }}>
        <button onClick={onLaunch} style={{
          width: '100%', padding: '9px',
          background: '#00A651', color: '#FFFFFF', border: 'none', cursor: 'pointer',
          fontFamily: MONO, fontSize: '12px', fontWeight: 700,
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

// ── Fleet bar ───────────────────────────────────────────────────────────────
function FleetBar({ cities }) {
  const run  = cities.filter(c => c.status === 'running').length
  const warn = cities.filter(c => c.status === 'warning').length
  const idle = cities.filter(c => c.status === 'idle').length
  const off  = cities.filter(c => c.status === 'offline').length
  const live = cities.filter(c => c.health > 0)
  const avg  = live.length ? Math.round(live.reduce((s,c) => s + c.health, 0) / live.length) : 0
  
  // Executive Aggregates
  const totalVolume = cities.reduce((s,c) => s + (c.volume_curr || 0), 0)
  const avgFPY = live.length ? (live.reduce((s,c) => s + c.fpy, 0) / live.length).toFixed(1) : 0

  return (
    <div style={{
      position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'stretch',
      background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: 4,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      zIndex: 1000, whiteSpace: 'nowrap', overflow: 'hidden',
    }}>
      {[
        { label: 'FLEET FPY',  val: `${avgFPY}%`, color: '#00A651', icon: 'verified' },
        { label: 'TOTAL VOL',  val: totalVolume,  color: '#2563EB', icon: 'package_2' },
        { label: 'AVG HEALTH', val: `${avg}%`, color: avg > 90 ? '#00A651' : '#D97706' },
      ].map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && <div style={{ width: 1, background: '#EEF2F0', alignSelf: 'stretch' }}/>}
          <div style={{ padding: '8px 16px', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
              {s.icon && <span className="material-symbols-outlined" style={{ fontSize: '18px', color: s.color }}>{s.icon}</span>}
              <div style={{ fontFamily: MONO, fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.val}
              </div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: '9px', color: '#9BB5A5', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


// ── Main ────────────────────────────────────────────────────────────────────
export default function FacilityMap() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selected, setSelected] = useState(null)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <style>{CSS}</style>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '0 24px', height: '64px', flexShrink: 0,
          background: '#FFFFFF', borderBottom: '1px solid #E2E8E4',
          fontFamily: MONO, zIndex: 2000,
        }}>
          <img src={logo} alt="INDI4 Logo" style={{ height: '32px', objectFit: 'contain', cursor: 'pointer' }} onClick={() => navigate('/')} />
          <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>
          <span style={{ fontSize: '13px', color: '#6B8075' }}>Facility Operations Centre</span>
          <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>
          <span style={{ fontSize: '12px', letterSpacing: '0.12em', color: '#9BB5A5', textTransform: 'uppercase' }}>India</span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#00A651',
                boxShadow: '0 0 8px rgba(0,166,81,0.6)', animation: 'dotBlink 1.5s ease-in-out infinite',
              }}/>
              <span style={{ fontSize: '12px', letterSpacing: '2px', color: '#00A651', fontWeight: 700, textTransform: 'uppercase' }}>LIVE</span>
            </div>
            <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0A1A10', letterSpacing: '0.05em' }}>{clock}</span>
            <div style={{ width: 1, height: 28, background: '#E2E8E4' }}/>
            <span style={{ fontSize: '13px', color: '#6B8075' }}>{user?.username ?? 'admin'}</span>
            <button onClick={() => { logout(); navigate('/login') }} style={{
              fontFamily: MONO, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
              background: 'none', border: 'none', cursor: 'pointer', color: '#AAB5AD', transition: 'color 0.2s', padding: 0,
            }}
              onMouseEnter={e => e.target.style.color = '#E53E3E'}
              onMouseLeave={e => e.target.style.color = '#AAB5AD'}
            >Sign out</button>
          </div>
        </header>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={[20.5, 78.9]}
            zoom={5}
            minZoom={4}
            maxZoom={8}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            {/* Clean light tile — CartoDB Positron */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            <MapBounds/>

            {CITIES.map(city => (
              <Marker
                key={city.id}
                position={[city.lat, city.lng]}
                icon={makeIcon(city, selected?.id === city.id)}
                eventHandlers={{
                  click: () => city.status !== 'offline' && setSelected(s => s?.id === city.id ? null : city),
                }}
              />
            ))}
          </MapContainer>

          <FleetBar cities={CITIES}/>

          {selected && (
            <>
              <div style={{ position: 'absolute', inset: 0, zIndex: 999 }} onClick={() => setSelected(null)}/>
              <StatsCard
                city={selected}
                onLaunch={() => navigate('/compressor-bed')}
                onClose={() => setSelected(null)}
              />
            </>
          )}

          {!selected && (
            <div style={{
              position: 'absolute', bottom: 18, right: 20, zIndex: 1000,
              fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em',
              color: '#9BB5A5', textTransform: 'uppercase',
              animation: 'hintFade 2.5s ease-in-out infinite', pointerEvents: 'none',
            }}>
              Select a facility → Launch digital twin
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const CSS = `
  .leaflet-container { background: #F4F7F5 !important; }
  .leaflet-tile-pane { filter: saturate(0.7) brightness(1.02); }

  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');

  @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  @keyframes hintFade  { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes cardIn    {
    from { opacity:0; transform:translateY(-50%) translateX(10px); }
    to   { opacity:1; transform:translateY(-50%) translateX(0); }
  }
`
