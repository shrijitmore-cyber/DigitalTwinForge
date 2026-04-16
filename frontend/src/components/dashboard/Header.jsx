import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'



export default function Header({ frame }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB')), 1000)
    return () => clearInterval(t)
  }, [])

  const phase   = frame?.display?.phase_label ?? 'IDLE'
  const running = frame && phase !== 'IDLE'

  function handleLogout() { logout(); navigate('/login') }

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '0 20px', height: '52px', flexShrink: 0,
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8E4',
      fontFamily: "'IBM Plex Mono', monospace",
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
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '5px 16px',
          border: '1px solid #00A651',
          color: '#FFFFFF',
          background: '#00A651',
          minWidth: '130px', textAlign: 'center',
        }}>
          {phase}
        </div>

        <Divider />

        {/* Live dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: running ? '#00A651' : '#D1D5D3',
            boxShadow: running ? '0 0 8px rgba(0,166,81,0.6)' : 'none',
            animation: running ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
            color: running ? '#00A651' : '#AAB5AD',
            fontWeight: running ? 700 : 400,
          }}>
            {running ? 'LIVE' : 'STANDBY'}
          </span>
        </div>

        <Divider />

        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '14px', fontWeight: 700,
          color: '#0A1A10', letterSpacing: '0.05em',
        }}>
          {clock}
        </span>

        <Divider />

        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px', color: '#6B8075',
        }}>
          {user?.username}
        </span>

        <button
          onClick={handleLogout}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#AAB5AD', transition: 'color 0.2s', padding: '0',
          }}
          onMouseEnter={e => e.target.style.color = '#E53E3E'}
          onMouseLeave={e => e.target.style.color = '#AAB5AD'}
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
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', letterSpacing: '0.06em' }}>
      <span style={{ color: '#6B8075' }}>{label} </span>
      <span style={{ color: '#0A1A10', fontWeight: 600 }}>{value}</span>
    </span>
  )
}
