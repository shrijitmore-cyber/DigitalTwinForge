import React from 'react';

const KpiCard = ({ label, value, sub, color = '#232E35' }) => (
  <div style={{
    background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: '4px',
    padding: '16px 20px', flex: 1, minWidth: '180px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    display: 'flex', flexDirection: 'column', gap: '4px'
  }}>
    <div style={{ 
      fontSize: '9px', fontWeight: 700, color: '#9BB5A5', 
      textTransform: 'uppercase', letterSpacing: '0.15em' 
    }}>
      {label}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ 
        fontSize: '24px', fontWeight: 700, color: color, 
        fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '-0.02em'
      }}>
        {value || '--'}
      </span>
      {sub && (
        <span style={{ 
          fontSize: '9px', fontWeight: 600, color: '#9BB5A5', 
          fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em' 
        }}>
          {sub}
        </span>
      )}
    </div>
  </div>
);

export default function KpiScorecard({ frame, ml }) {
  const elapsed = frame?.display?.elapsed_label || '--:--:--';
  const readings = ml?.n_readings || '0';
  
  // Color logic for confidence matching reference
  const conf = ml?.confidence_pct || 0;
  const confColor = (ml?.action === 'WAIT') ? '#9BB5A5' :
                    (conf >= 80) ? '#16A34A' : 
                    (conf >= 50) ? '#D97706' : '#DC2626';

  return (
    <div style={{ 
      display: 'flex', gap: '16px', padding: '0 20px', 
      marginBottom: '20px', flexWrap: 'wrap' 
    }}>
      <KpiCard label="ELAPSED TIME" value={elapsed} color="#0A1A10" />
      <KpiCard label="TOTAL READINGS" value={readings} color="#0A1A10" />
      <KpiCard 
        label="PREDICTED STABLE @" 
        value={ml?.predicted_stable_min ? ml.predicted_stable_min.toFixed(1) : '--'} 
        sub="MIN"
        color="#2563EB"
      />
      <KpiCard 
        label="TIME SAVED" 
        value={ml?.time_saved_min ? `+${Math.round(ml.time_saved_min)}` : '--'} 
        sub="MIN"
        color={ml?.time_saved_min > 0 ? '#16A34A' : '#9BB5A5'}
      />
      <KpiCard 
        label="CONFIDENCE" 
        value={ml?.confidence_pct != null ? `${ml.confidence_pct.toFixed(1)}` : '--'} 
        sub="%"
        color={confColor}
      />
    </div>
  );
}
