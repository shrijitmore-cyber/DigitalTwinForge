const SPEEDS = [1, 10, 30, 60, 120]

const S = {
  root: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0 20px', height: '48px', flexShrink: 0,
    background: '#FFFFFF',
    borderTop: '1px solid #E2E8E4',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  divider: { width: '1px', height: '26px', background: '#E2E8E4', flexShrink: 0 },
  label:   { fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9BB5A5' },
}

function CtrlBtn({ onClick, children, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '32px', height: '32px', borderRadius: '4px',
        border: active ? '1px solid #00A651' : '1px solid #D4E0DA',
        background: active ? '#00A651' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#0A1A10',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F4F7F5'; e.currentTarget.style.borderColor = '#00A651' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D4E0DA' } }}
    >
      {children}
    </button>
  )
}

export default function Controls({ playing, speed, idx, total, onPlay, onPause, onReset, onSpeedChange, onSeek }) {
  const elapsed = idx * 15
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const elStr = `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`

  return (
    <div style={S.root}>
      <CtrlBtn onClick={onPlay}  active={playing}>▶</CtrlBtn>
      <CtrlBtn onClick={onPause} active={false}>⏸</CtrlBtn>
      <CtrlBtn onClick={onReset} active={false}>↩</CtrlBtn>

      <div style={S.divider} />

      <span style={S.label}>Speed</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {SPEEDS.map(sp => {
          const active = speed === sp
          return (
            <button
              key={sp}
              onClick={() => onSpeedChange(sp)}
              style={{
                padding: '3px 10px', borderRadius: '3px',
                border: active ? '1px solid #00A651' : '1px solid #D4E0DA',
                background: active ? '#00A651' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#6B8075',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px', cursor: 'pointer', transition: 'all 0.15s',
                fontWeight: active ? 700 : 400,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#0A1A10'; e.currentTarget.style.borderColor = '#00A651' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#6B8075'; e.currentTarget.style.borderColor = '#D4E0DA' } }}
            >
              {sp}×
            </button>
          )
        })}
      </div>

      <div style={S.divider} />

      <span style={{ ...S.label, minWidth: '28px' }}>0:00</span>
      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={idx}
        onChange={e => onSeek(parseInt(e.target.value))}
        style={{ flex: 1, height: '3px', cursor: 'pointer', accentColor: '#00A651' }}
      />
      <span style={{ ...S.label, minWidth: '34px', textAlign: 'right' }}>3:00h</span>

      <div style={S.divider} />

      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '13px', fontWeight: 700,
        color: '#0A1A10', minWidth: '64px', textAlign: 'right',
      }}>
        {elStr}
      </span>
    </div>
  )
}
