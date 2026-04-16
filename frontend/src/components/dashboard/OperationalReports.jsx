import React from 'react';

const T = {
  section: { borderBottom: '1px solid #EEF2F0', padding: '16px 20px' },
  sHead:   { fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00A651', marginBottom: '16px', fontFamily: "'IBM Plex Mono', monospace" },
  row:     { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F4F7F5', fontSize: '11px' },
  label:   { color: '#6B8075', fontFamily: "'IBM Plex Sans', sans-serif" },
  value:   { color: '#111827', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }
};

function ReadinessItem({ label, value, color }) {
  return (
    <div style={T.row}>
      <span style={T.label}>{label}</span>
      <span style={{ ...T.value, color: color || '#111827' }}>{value}</span>
    </div>
  );
}

export default function OperationalReports({ ml }) {
  if (!ml) return null;

  const readiness = ml.readiness || {};
  const status    = ml.param_status || { green: 0, amber: 0, red: 0 };
  const targets   = ml.targets || {};

  // Status mapping matching DigitalTwin2 logic
  const isStable = ml.action === 'SAFE_TO_STOP' || ml.action === 'ALREADY_STABLE';
  
  return (
    <>
      {/* ── Readiness Report ── */}
      <div style={T.section}>
        <div style={T.sHead}>Readiness Checklist</div>
        <ReadinessItem label="Stability Declared" value={isStable ? 'YES' : 'NO'} color={isStable ? '#16A34A' : '#DC2626'} />
        <ReadinessItem label="SS FAD" value={readiness.ss_ref ? `${readiness.ss_ref.toFixed(1)} CFM` : '--'} />
        <ReadinessItem label="Spec Min" value={readiness.spec_min ? `${readiness.spec_min.toFixed(1)} CFM` : '--'} />
        <ReadinessItem label="FAD Margin" value={readiness.margin_pct != null ? `${readiness.margin_pct}%` : '--'} color={readiness.margin_pct >= 0 ? '#16A34A' : '#DC2626'} />
        <ReadinessItem label="Time Saved" value={ml.time_saved_min ? `+${Math.round(ml.time_saved_min)} min` : '--'} color="#16A34A" />
        <ReadinessItem label="Confidence" value={`${ml.confidence_pct}%`} />
        <ReadinessItem label="Model MAE" value={ml.model_mae_min ? `${ml.model_mae_min} min` : '--'} />
        
        {/* Verdict Badge */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#9BB5A5', letterSpacing: '0.1em' }}>VERDICT</span>
          <div style={{
            fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '4px',
            background: isStable ? '#DCFCE7' : (ml.confidence_pct >= 50 ? '#FEF9C3' : '#F1F5F9'),
            color: isStable ? '#166534' : (ml.confidence_pct >= 50 ? '#854D0E' : '#94A3B8'),
            border: `1px solid ${isStable ? '#BBF7D0' : (ml.confidence_pct >= 50 ? '#FEF08A' : '#E2E8F0')}`
          }}>
            {isStable ? 'PASS ✓' : (ml.confidence_pct >= 50 ? 'IN PROGRESS' : 'PENDING')}
          </div>
        </div>
      </div>

      {/* ── Sigma Analysis ── */}
      <div style={T.section}>
        <div style={T.sHead}>Sigma Analysis (Current)</div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {[
            { label: 'STABLE', count: status.green, color: '#00A651' },
            { label: 'BIAS', count: status.amber, color: '#D97706' },
            { label: 'DISTANT', count: status.red, color: '#DC2626' }
          ].map(p => (
            <div key={p.label} style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: p.color }}>{p.count}</div>
              <div style={{ fontSize: '7px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em' }}>{p.label}</div>
            </div>
          ))}
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EEF2F0', textAlign: 'left', color: '#9BB5A5' }}>
                <th style={{ padding: '6px 0', fontWeight: 700, letterSpacing: '0.05em' }}>SENSOR</th>
                <th style={{ padding: '6px 0', fontWeight: 700, textAlign: 'right', letterSpacing: '0.05em' }}>σ DEV</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ml.current_sensors || {}).slice(0, 7).map(([key, val]) => {
                const target = targets[key] || {};
                const sigma  = target.std ? Math.abs((val - target.ref) / target.std) : 0;
                const color  = sigma < 1.0 ? '#16A34A' : sigma < 2.0 ? '#D97706' : '#DC2626';
                
                return (
                  <tr key={key} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '8px 0', color: '#6B8075', textTransform: 'uppercase', fontSize: '9px', fontWeight: 500 }}>
                      {key.replace(/_/g, ' ').replace('airend discharge temp c', 'AIREND TEMP').replace('fad cfm', 'FAD FLOW')}
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: color, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {sigma.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
