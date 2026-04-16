import { useState, useEffect } from 'react'

const T = {
  panel:   { width: '280px', flexShrink: 0, background: '#FFFFFF', display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', borderRight: '1px solid #E2E8E4' },
  section: { borderBottom: '1px solid #EEF2F0', padding: '16px 20px' },
  sHead:   { fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00A651', marginBottom: '16px', fontFamily: "'IBM Plex Mono', monospace" },
  bodyTxt: { fontSize: '12px', color: '#4A6B55', fontFamily: "'IBM Plex Sans', sans-serif" }
}

function HealthScoreGauge({ score, baseline }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Decide color based on score
  const color = score > 90 ? '#00A651' : score > 75 ? '#CA8A04' : '#DC2626';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Background track */}
        <svg width="120" height="120" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle
            cx="60" cy="60" r={radius}
            fill="transparent" stroke="#EEF2F0" strokeWidth="8"
          />
          {/* Progress track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="transparent" stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
          />
        </svg>
        {/* Score Text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 700, color: '#0A1A10', lineHeight: 1 }}>{Math.round(score)}</span>
        </div>
      </div>
      
      {/* Context info */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#9BB5A5', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace" }}>ASSET VITALITY</span>
        </div>
      </div>
    </div>
  )
}

function AnomalyCard({ title, desc, prob, status }) {
  const statusColor = status === 'alert' ? '#DC2626' : status === 'warn' ? '#CA8A04' : '#00A651';
  const bgColor = status === 'alert' ? 'rgba(220,38,38,0.04)' : status === 'warn' ? 'rgba(202,138,4,0.04)' : 'rgba(0,166,81,0.04)';
  const borderColor = status === 'alert' ? 'rgba(220,38,38,0.15)' : status === 'warn' ? 'rgba(202,138,4,0.15)' : 'rgba(0,166,81,0.15)';

  return (
    <div style={{
      background: bgColor, border: `1px solid ${borderColor}`,
      padding: '12px', borderRadius: '6px', marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, animation: status === 'alert' ? 'pulse-dot 1.5s infinite' : 'none' }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', fontWeight: 700, color: '#4A6B55', background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #EEF2F0' }}>
          {prob}% CONF
        </span>
      </div>
      <div style={T.bodyTxt}>{desc}</div>
    </div>
  )
}

export default function IntelligencePanel({ frame }) {
  const [healthScore, setHealthScore] = useState(94.2);
  
  // Slight fluctuation of health score for realism
  useEffect(() => {
    const int = setInterval(() => {
      setHealthScore(prev => {
        const jitter = (Math.random() - 0.5) * 1.5;
        let next = prev + jitter;
        if (next > 99) next = 99;
        if (next < 85) next = 85;
        return next;
      })
    }, 3000);
    return () => clearInterval(int);
  }, []);

  return (
    <aside style={T.panel}>
      {/* Engine Health Header */}
      <div style={{ background: '#F4F7F5', borderBottom: '1px solid #E2E8E4', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px' }}>🧠</span>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: '#0A1A10', letterSpacing: '0.02em' }}>Intelligence</span>
        </div>
        <div style={{ fontSize: '11px', color: '#4A6B55', fontFamily: "'IBM Plex Sans', sans-serif" }}>
          ML Predictive Analytics & Health
        </div>
      </div>

      <Section title="Health Scoring Engine">
        <HealthScoreGauge score={healthScore} baseline={95} />
        <div style={{ fontSize: '10px', color: '#9BB5A5', textAlign: 'center', marginTop: '8px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Unified asset vitality calculated from mechanical, electrical & thermal KPIs.
        </div>
      </Section>

      <Section title="Anomaly Detection">
        <AnomalyCard 
          title="Thermal Shift" 
          desc="Airend discharge temp forming an unsupervised mild rising cluster." 
          prob={87} 
          status="warn" 
        />
        <AnomalyCard 
          title="Vibration Profile" 
          desc="Motor bearings operating within expected baseline limits." 
          prob={98} 
          status="ok" 
        />
      </Section>
      
      <Section title="Simulation & What-If">
        <div style={{ padding: '12px', background: '#F9FAFA', border: '1px dashed #C5D5CB', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>🕹️</span>
          <div style={{ fontSize: '11px', color: '#4A6B55', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: '8px' }}>
            Run hypothetical load scenarios without risking physical equipment.
          </div>
          <button style={{
            background: '#FFFFFF', border: '1px solid #00A651', color: '#00A651',
            padding: '6px 12px', fontSize: '10px', fontFamily: "'IBM Plex Mono', monospace",
            borderRadius: '4px', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>Launch Sandbox</button>
        </div>
      </Section>

    </aside>
  )
}

function Section({ title, children }) {
  return (
    <div style={T.section}>
      <div style={T.sHead}>{title}</div>
      {children}
    </div>
  )
}
