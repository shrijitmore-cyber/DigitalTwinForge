import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSimulation } from '../../context/SimulationContext'

export default function Header({ frame }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { playing, play, pause, reset, speed, changeSpeed, connected } = useSimulation()
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000)
    return () => clearInterval(t)
  }, [])

  const phase = frame?.display?.phase_label ?? 'IDLE'
  const isLive = frame && phase !== 'IDLE'

  function handleLogout() { logout(); navigate('/login') }

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '0 20px', height: '52px', flexShrink: 0,
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8E4',
      fontFamily: "'Inter', sans-serif",
    }}>
      <span style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.05em' }}>INDI4</span>

      <Divider />
      <Meta label="Serial" value="SCR0010046 T1" />
      <Divider />
      <Meta label="WP"     value="8 kg/cm²g" />
      <Divider />
      <Meta label="FAD"    value="127 CFM" />

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Phase badge */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '5px 16px',
          border: '1px solid #00A651',
          color: '#FFFFFF',
          background: '#00A651',
          minWidth: '130px', textAlign: 'center',
          borderRadius: '4px'
        }}>
          {phase}
        </div>

        <Divider />

        {/* Live dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: connected ? '#16A34A' : '#9CA3AF',
            boxShadow: connected ? '0 0 6px rgba(22, 163, 74, .5)' : 'none',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: '11px', color: '#6B7280', fontWeight: 500
          }}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <Divider />

        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1E2C' }}>
          {clock}
        </span>

        <Divider />

        <button
          onClick={handleLogout}
          style={{
            fontSize: '11px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer'
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}

function Divider() {
  return <div style={{ width: '1px', height: '24px', background: '#E2E8E4', flexShrink: 0 }} />
}

function Meta({ label, value }) {
  return (
    <span style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
      <span style={{ color: '#6B7280' }}>{label} </span>
      <span style={{ color: '#1A1E2C', fontWeight: 600 }}>{value}</span>
    </span>
  )
}
