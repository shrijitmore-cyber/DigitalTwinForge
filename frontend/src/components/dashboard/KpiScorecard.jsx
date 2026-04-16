import React from 'react';

const KpiCard = ({ label, value, color = '#232E35' }) => (
  <div style={{
    background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: '12px',
    padding: '16px 20px', flex: 1, minWidth: '180px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: '4px'
  }}>
    <div style={{ 
      fontSize: '0.6rem', fontWeight: 600, color: '#6b7280', 
      textTransform: 'uppercase', letterSpacing: '0.07em' 
    }}>
      {label}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ 
        fontSize: '1.05rem', fontWeight: 600, color: color, 
        fontFamily: "'JetBrains Mono', ui-monospace, monospace"
      }}>
        {value || '--'}
      </span>
    </div>
  </div>
);

export default function KpiScorecard({ frame, ml }) {
  // Fix: Correctly grab readings and elapsed from the 'ml' intelligence data
  const readings = (ml?.n_readings != null && ml.n_readings > 0) ? ml.n_readings : '--';
  const elapsed = (ml?.elapsed_min != null && ml.elapsed_min > 0) ? `${ml.elapsed_min.toFixed(1)} min` : '--';
  
  const conf = ml?.confidence_pct || 0;
  const confColor = (ml?.action === 'WAIT') ? '#6b7280' :
                    (conf >= 80) ? '#16a34a' : 
                    (conf >= 50) ? '#d97706' : '#dc2626';

  return (
    <div style={{ 
      display: 'flex', gap: '8px', padding: '0 20px', 
      marginBottom: '12px', flexWrap: 'wrap' 
    }}>
      <KpiCard label="ELAPSED" value={elapsed} />
      <KpiCard label="READINGS" value={readings} />
      <KpiCard 
        label="PREDICTED STABLE @" 
        value={ml?.predicted_stable_min ? `${ml.predicted_stable_min.toFixed(1)} min` : '--'} 
        color="#1a1e2c"
      />
      <KpiCard 
        label="TIME SAVED (VS 3 H)" 
        value={(ml?.time_saved_min != null && ml.time_saved_min > 0) ? `${ml.time_saved_min.toFixed(0)} min` : '--'} 
        color={ml?.time_saved_min > 0 ? '#16a34a' : '#1a1e2c'}
      />
      <KpiCard 
        label="CONFIDENCE" 
        value={ml?.confidence_pct != null ? `${ml.confidence_pct.toFixed(1)}%` : '--'} 
        color={confColor}
      />
    </div>
  );
}
