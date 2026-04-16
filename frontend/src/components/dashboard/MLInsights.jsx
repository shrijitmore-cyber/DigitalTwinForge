import React from 'react';

const T = {
  section: { borderBottom: '2px solid #F4F7F5', padding: '16px 20px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FBFA 100%)' },
  sHead:   { fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563EB', marginBottom: '12px', fontFamily: "'IBM Plex Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' },
  label:   { fontSize: '11px', color: '#6B8075', fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: '0.01em' },
  value:   { fontSize: '14px', fontWeight: 700, color: '#111827', fontFamily: "'IBM Plex Mono', monospace" },
  card:    { background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: '6px', padding: '12px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }
};

const ACTION_THEME = {
  'SAFE_TO_STOP':      { color: '#00A651', bg: 'rgba(0,166,81,0.06)', border: '#00A651', icon: '✅', label: 'SAFE TO CONCLUDE' },
  'PREPARE_STOP':      { color: '#2563EB', bg: 'rgba(37,99,235,0.06)', border: '#2563EB', icon: '⌛', label: 'STABILIZING...' },
  'CONTINUE_MONITORING': { color: '#D97706', bg: 'rgba(217,119,6,0.06)', border: '#D97706', icon: '🔍', label: 'MONITORING' },
  'WAIT':              { color: '#94A3B8', bg: 'rgba(148,163,184,0.06)', border: '#94A3B8', icon: '🕒', label: 'COLLECTING DATA' },
  'ALREADY_STABLE':    { color: '#00A651', bg: 'rgba(0,166,81,0.06)', border: '#00A651', icon: '✨', label: 'STABLE RUN' },
};

function StatusPill({ status }) {
  const colors = {
    'stable':     { bg: '#DCFCE7', text: '#166534', label: 'STABLE' },
    'converging': { bg: '#DBEAFE', text: '#1E40AF', label: 'CONVERGING' },
    'transient':  { bg: '#F1F5F9', text: '#475569', label: 'TRANSIENT' }
  };
  const theme = colors[status] || colors.transient;
  return (
    <span style={{ 
      fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', 
      padding: '2px 8px', borderRadius: '12px', background: theme.bg, color: theme.text 
    }}>{theme.label}</span>
  );
}

export default function MLInsights({ ml }) {
  if (!ml) return (
    <div style={T.section}>
      <div style={T.sHead}><span>🧠</span> STABILITY ANALYSIS</div>
      <div style={{ fontSize: '11px', color: '#9BB5A5', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
        Initializing ML Engine...
      </div>
    </div>
  );

  const action = ACTION_THEME[ml.action] || ACTION_THEME.WAIT;
  const conf = ml.confidence_pct || 0;
  
  // Radial Gauge Math
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (conf / 100) * circ;

  return (
    <div style={T.section}>
      <div style={T.sHead}>
        <span>🧠</span> STABILITY ANALYSIS
        <div style={{ marginLeft: 'auto' }}>
           <StatusPill status={ml.sensor_status} />
        </div>
      </div>

      {/* Main Gauge & Action */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
             <circle cx="40" cy="40" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="6" />
             <circle cx="40" cy="40" r={radius} fill="none" stroke={action.color} strokeWidth="6"
               strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
               style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827', fontFamily: "'IBM Plex Mono', monospace" }}>{Math.round(conf)}%</span>
            <span style={{ fontSize: '7px', fontWeight: 700, color: '#6B8075', letterSpacing: '0.1em' }}>CONFIDENCE</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
           <div style={{ 
             background: action.bg, border: `1px solid ${action.border}33`, 
             borderRadius: '6px', padding: '10px', textAlign: 'center'
           }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{action.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: action.color, letterSpacing: '0.1em' }}>{action.label}</div>
           </div>
        </div>
      </div>

      {/* Stability Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={T.card}>
          <div style={T.label}>TTS</div>
          <div style={T.value}>{ml.time_to_stability_min ?? '--'} <span style={{fontSize: '9px', color: '#9BB5A5'}}>MIN</span></div>
        </div>
        <div style={T.card}>
          <div style={T.label}>DEV (Σ)</div>
          <div style={T.value}>{ml.total_deviation?.toFixed(3) ?? '--'}</div>
        </div>
      </div>

      {/* Forecasted Sensors */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: '#9BB5A5', letterSpacing: '0.12em', marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
          STABLE STATE FORECAST
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
           {Object.entries(ml.predicted_sensors || {}).slice(0, 4).map(([key, val]) => (
             <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                <span style={{ fontSize: '10px', color: '#6B8075', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ').replace('temp c', '°C')}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#111827', fontFamily: "'IBM Plex Mono', monospace" }}>{val.toFixed(1)}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
