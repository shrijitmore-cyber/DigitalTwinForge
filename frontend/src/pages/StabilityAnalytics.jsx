import { useState } from 'react'
import Header       from '../components/dashboard/Header'
import ModelViewer  from '../components/dashboard/ModelViewer'
import RightPanel   from '../components/dashboard/RightPanel'
import HealthDrawer from '../components/dashboard/HealthDrawer'
import ActionBanner from '../components/dashboard/ActionBanner'
import KpiScorecard from '../components/dashboard/KpiScorecard'
import TrajectorySuite from '../components/dashboard/TrajectorySuite'
import OperationalReports from '../components/dashboard/OperationalReports'
import CheckpointTable from '../components/dashboard/CheckpointTable'
import { useSimulation } from '../context/SimulationContext'

const SOCKET_URL = '/'

const PHASE_COLOR = {
  'WARMUP':       '#4f9cf9',
  'STABILIZING':  '#F0A500',
  'RATED RUN':    '#00A651',
  'UNLOAD CYCLE': '#ffe566',
  'IDLE':         'rgba(0,166,81,0.3)',
}

export default function StabilityAnalytics() {
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
      
      {/* ── Intelligence Layer ── */}
      <ActionBanner ml={frame?.ml} />
      <KpiScorecard frame={frame} ml={frame?.ml} />

      {/* ── Body: 3 columns layout ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>

        {showHealth && <HealthDrawer frame={frame} onClose={() => setShowHealth(false)} />}

        {/* ── Center: model + trajectory charts ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflowY: 'auto', overflowX: 'hidden', minWidth: 0,
        }}>

        {/* ── Miniature Schematic pane (Optimized for space) ── */}
        <div style={{
          flexShrink: 0, height: '400px',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', position: 'relative',
          background: '#F4F7F5', borderBottom: '1px solid #E2E8E4'
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
              <MetaBadge label="STABILITY STATUS" value={frame?.ml?.sensor_status ?? 'COLLECTING...'} valueColor={frame?.ml?.sensor_status === 'stable' ? '#00A651' : '#2563EB'} />
            </div>
            
            <button 
                onClick={() => window.history.back()}
                style={{
                    background: '#2563EB', color: '#FFF', border: 'none', padding: '4px 12px',
                    borderRadius: '4px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'IBM Plex Mono', monospace"
                }}
            >
                ← BACK TO DASHBOARD
            </button>
          </div>

          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative', zIndex: 1,
          }}>
            <ModelViewer frame={frame} />
          </div>
        </div>

        {/* ── Trajectory Suite ── */}
        <div style={{
          flexShrink: 0,
          background: '#FFFFFF',
          padding: '16px 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}>
          <TrajectorySuite history={history} ml={frame?.ml} />
          
          {/* Accuracy Audit Table */}
          <div style={{ padding: '0 20px' }}>
            <CheckpointTable ml={frame?.ml} />
          </div>
        </div>

        </div>{/* end left column */}

        {/* ── Right column: operational reports ── */}
        <div style={{
          width: '320px', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          borderLeft: '1px solid #E2E8E4',
          background: '#FFFFFF',
        }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <OperationalReports ml={frame?.ml} />
            <RightPanel frame={frame} hideInference={true} />
          </div>
        </div>
      </div>
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
