import React from 'react';

const SHORT = {
  airend_discharge_temp_c: "Disc Temp",
  fad_cfm: "FAD",
  motor_output_power_kw: "Motor Power",
  delivery_pressure_kg_cm2g: "Del. Press.",
  package_input_power_kw: "Pkg Power",
  spc_kw_per_m3_min: "SPC",
  power_factor: "PF",
};

const UNITS = {
  airend_discharge_temp_c: "°C",
  fad_cfm: "CFM",
  motor_output_power_kw: "kW",
  delivery_pressure_kg_cm2g: "kg/cm²g",
  package_input_power_kw: "kW",
  spc_kw_per_m3_min: "kW/m³/min",
  power_factor: "",
};

const T = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' },
  th: { padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #e2e6ed', fontWeight: 600 },
  td: { padding: '12px', borderBottom: '1px solid #e2e6ed', verticalAlign: 'middle' },
  num: { fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' },
  predVal: { color: '#6d28d9', fontWeight: 600, fontSize: '12px' },
  actualVal: { color: '#6b7280', fontSize: '10px', marginTop: '2px' },
  errorVal: { fontSize: '9px', fontWeight: 700, marginTop: '2px' }
};

export default function CheckpointTable({ ml }) {
  if (!ml || !ml.checkpoints) return null;

  const checkpoints = Object.values(ml.checkpoints).sort((a, b) => a.checkpoint_min - b.checkpoint_min);
  const sensors = Object.keys(ml.current_sensors || {});

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #e2e6ed', borderRadius: '12px',
      padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, .06)', marginTop: '20px'
    }}>
      <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>
        Prediction Table — Predicted vs Actual
      </h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={T.table}>
          <thead>
            <tr>
              <th style={{ ...T.th, width: '120px' }}>Sensor</th>
              <th style={{ ...T.th, width: '60px' }}>Unit</th>
              {checkpoints.map(cp => (
                <th key={cp.checkpoint_min} style={T.th} className="num">
                  t={cp.checkpoint_min} min
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensors.map(s => (
              <tr key={s}>
                <td style={{ ...T.td, fontWeight: 500, color: '#1a1e2c' }}>{SHORT[s] || s}</td>
                <td style={{ ...T.td, color: '#6b7280' }}>{UNITS[s] || ''}</td>
                {checkpoints.map(cp => {
                  const pvRaw = cp.predicted_sensors ? cp.predicted_sensors[s] : null;
                  const pv = pvRaw?.p50 ?? pvRaw;
                  const av = cp.actual_sensors ? cp.actual_sensors[s] : null;
                  
                  let error = null;
                  if (pv != null && av != null && av !== 0 && typeof pv === 'number') {
                    error = Math.abs(((pv - av) / av) * 100);
                  }

                  const isProj = ml.elapsed_min < cp.checkpoint_min - 0.5;
                  const errColor = error > 7 ? '#dc2626' : error > 3 ? '#d97706' : '#16a34a';

                  return (
                    <td key={cp.checkpoint_min} style={{ ...T.td, ...T.num }}>
                      {pv != null ? (
                        <div style={{ color: isProj ? '#d97706' : '#6d28d9', fontWeight: 600 }}>
                          ◆ {pv.toFixed(1)}
                        </div>
                      ) : (
                        <div style={{ color: '#9ca3af' }}>--</div>
                      )}
                      
                      {av != null && (
                        <div style={T.actualVal}>actual: {av.toFixed(1)}</div>
                      )}
                      
                      {error != null && (
                        <div style={{ ...T.errorVal, color: errColor }}>
                          ±{error.toFixed(1)}%
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
