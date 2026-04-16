import React from 'react';

const THEMES = {
  WAIT: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0', pill: '#94A3B8', icon: '🕒' },
  CONTINUE_MONITORING: { bg: '#ECFEFF', text: '#0891B2', border: '#CFFAFE', pill: '#22D3EE', icon: '🔍' },
  PREPARE_STOP: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', pill: '#FBBF24', icon: '⌛' },
  SAFE_TO_STOP: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0', pill: '#22C55E', icon: '✅' },
  ALREADY_STABLE: { bg: '#EFF6FF', text: '#1E40AF', border: '#DBEAFE', pill: '#3B82F6', icon: '✨' },
};

const MESSAGES = {
  WAIT: "Collecting baseline data (Min 15m elapsed & 20 readings required)...",
  CONTINUE_MONITORING: "System is still in transient state. Continue monitoring convergence trends.",
  PREPARE_STOP: "Approach to stability detected. Prepare pre-stop inspection checklist.",
  SAFE_TO_STOP: "Confidence threshold reached. Machine is stable and ready for test conclusion.",
  ALREADY_STABLE: "Steady-state rated operation confirmed. Simulation phase complete.",
};

export default function ActionBanner({ ml }) {
  const status = ml?.action || 'WAIT';
  const theme = THEMES[status] || THEMES.WAIT;
  const msg = MESSAGES[status] || MESSAGES.WAIT;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 16px', borderRadius: '8px', 
      background: theme.bg, border: `1px solid ${theme.border}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      margin: '8px 16px', flexShrink: 0
    }}>
      <div style={{
        fontSize: '9px', fontWeight: 800, color: '#FFFFFF',
        background: theme.pill, padding: '3px 10px', borderRadius: '4px',
        letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap'
      }}>
        {status.replace(/_/g, ' ')}
      </div>
      <div style={{ fontSize: '18px' }}>{theme.icon}</div>
      <div style={{ 
        fontSize: '13px', color: theme.text, 
        fontFamily: "'IBM Plex Sans', sans-serif", flex: 1, fontWeight: 500 
      }}>
        {msg}
      </div>
      {ml?.confidence_pct != null && (
        <div style={{ fontSize: '11px', color: theme.pill, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>
          {ml.confidence_pct}% CONFIDENCE
        </div>
      )}
    </div>
  );
}
