import { useState } from 'react'
import Header       from '../components/dashboard/Header'
import ModelViewer  from '../components/dashboard/ModelViewer'
import RightPanel   from '../components/dashboard/RightPanel'
import HealthDrawer from '../components/dashboard/HealthDrawer'
import ChartStrip   from '../components/dashboard/ChartStrip'
import { Link } from 'react-router-dom'
import { useSimulation } from '../context/SimulationContext'

const SOCKET_URL = '/'

const PHASE_COLOR = {
  'WARMUP':       '#4f9cf9',
  'STABILIZING':  '#F0A500',
  'RATED RUN':    '#00A651',
  'UNLOAD CYCLE': '#ffe566',
  'IDLE':         'rgba(0,166,81,0.3)',
}

export default function Dashboard() {
  const {
    connected,
    totalRows,
    frame,
    idx,
    playing,
    history,
  } = useSimulation();
  
  const [showHealth, setShowHealth] = useState(false)

  const phase      = frame?.display?.phase_label ?? 'IDLE'
  const phaseColor = PHASE_COLOR[phase] ?? '#00A651'
  const alertCount = frame?.health?.alerts?.filter(a => a.status !== 'ok').length ?? 0

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: '#F4F7F5',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      {/* Phase accent stripe */}
      <div style={{
        height: '2px', flexShrink: 0,
        background: `linear-gradient(90deg, transparent, ${phaseColor} 30%, ${phaseColor} 70%, transparent)`,
        opacity: playing ? 1 : 0.3,
        transition: 'background 0.6s, opacity 0.4s',
      }} />

      <Header frame={frame} />

      {/* ── Body: 3 columns layout ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>

        {showHealth && <HealthDrawer frame={frame} onClose={() => setShowHealth(false)} />}

        {/* ── Center: model + chart strip ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflowY: 'auto', overflowX: 'hidden', minWidth: 0,
        }}>

        {/* ── Schematic pane ── */}
        <div style={{
          flexShrink: 0, height: 'calc(100vh - 54px)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', position: 'sticky', top: 0,
          background: '#F4F7F5', zIndex: 1,
        }}>
          {/* subtle grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: `
              linear-gradient(rgba(0,100,50,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,100,50,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
          }} />
          {/* phase radial vignette */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${phaseColor}08 0%, transparent 70%)`,
            transition: 'background 0.8s',
          }} />

          {/* Connecting overlay */}
          {!connected && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(244,247,245,0.85)', backdropFilter: 'blur(4px)',
            }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase',
                color: '#00A651', animation: 'pulse-dot 1.5s ease-in-out infinite',
              }}>● CONNECTING TO SERVER…</span>
            </div>
          )}

          {/* Meta bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 18px', flexShrink: 0, position: 'relative', zIndex: 1,
            borderBottom: '1px solid #E2E8E4',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <MetaBadge label="PHASE"   value={phase}                                  valueColor={phaseColor} />
              <MetaBadge label="ELAPSED" value={frame?.display?.elapsed_label ?? '0:00:00'} />
              <MetaBadge label="FRAME"   value={frame ? `${idx + 1} / ${totalRows}` : '— / —'} />
              <MetaBadge label="FAN"     value={frame?.display?.fan_status ?? '—'}
                valueColor={frame?.display?.fan_status === 'RUNNING' ? '#00A651' : '#9BB5A5'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {alertCount > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '3px 10px', borderRadius: '2px',
                  border: '1px solid rgba(220,38,38,0.35)',
                  background: 'rgba(220,38,38,0.06)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px', letterSpacing: '0.12em', color: '#DC2626',
                }}>
                  <span style={{ animation: 'blink .8s step-end infinite' }}>●</span>
                  {alertCount} ALERT{alertCount > 1 ? 'S' : ''}
                </div>
              )}
              <button
                onClick={() => setShowHealth(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '3px 11px', borderRadius: '2px', cursor: 'pointer',
                  border: `1px solid ${showHealth ? '#00A651' : '#C5D5CB'}`,
                  background: showHealth ? 'rgba(0,166,81,0.08)' : '#FFFFFF',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px', letterSpacing: '0.12em',
                  color: showHealth ? '#00A651' : '#6B8A78',
                  fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '8px' }}>♥</span>
                HEALTH
              </button>
              
              <Link
                to="/analytics"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '3px 11px', borderRadius: '2px', cursor: 'pointer',
                  border: '1px solid #2563EB',
                  background: 'rgba(37,99,235,0.08)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px', letterSpacing: '0.12em',
                  color: '#2563EB', textDecoration: 'none',
                  fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <span>📈</span>
                DEEP ANALYTICS
              </Link>
            </div>
          </div>

          {/* SVG — fills all remaining space */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', padding: '16px 20px',
            position: 'relative', zIndex: 1,
          }}>
            <ModelViewer frame={frame} />
          </div>
        </div>

        {/* ── Chart strip — scrolls over model ── */}
        <div style={{
          flexShrink: 0,
          position: 'relative', zIndex: 2,
          borderTop: '2px solid #E2E8E4',
          background: '#F4F7F5',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}>
          <ChartStrip history={history} />
        </div>

        </div>{/* end left column */}

        {/* ── Right column: metrics only, full height, scrollable ── */}
        <div style={{
          width: '280px', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          borderLeft: '1px solid #E2E8E4',
          background: '#FFFFFF',
        }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <RightPanel frame={frame} />
          </div>
        </div>
      </div>

      {/* Controls removed — Auto-playing at 10x speed with looping */}
    </div>
  )
}

function MetaBadge({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: '#9BB5A5',
      }}>{label}</span>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px', fontWeight: 600,
        color: valueColor ?? '#0A1A10',
        letterSpacing: '0.06em',
      }}>{value}</span>
    </div>
  )
}
