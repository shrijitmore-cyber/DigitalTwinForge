import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const INTER = "'Inter', system-ui, sans-serif";

const COLORS = {
  ACTUAL: '#d97706',
  PRED_P50: '#6d28d9',
  PRED_PXX: 'rgba(109, 40, 217, 0.4)',
  SS_LINE: '#16a34a',
  BAND: 'rgba(16, 185, 129, 0.08)',
  GRID: '#f0f0f0',
  TEXT: '#6b7280'
};

const ChartCard = ({ title, children }) => (
  <div style={{
    background: '#FFFFFF', border: '1px solid #e2e6ed', borderRadius: '12px',
    padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, .06)',
    display: 'flex', flexDirection: 'column', height: '100%'
  }}>
    <h2 style={{ 
      fontSize: '11px', fontWeight: 700, color: COLORS.TEXT, 
      textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px'
    }}>
      {title}
    </h2>
    <div style={{ flex: 1, minHeight: '280px', position: 'relative' }}>
      {children}
    </div>
  </div>
);

export default function TrajectorySuite({ history, ml }) {
  if (!history || history.length === 0) return null;

  const labels = history.map(h => {
    const time = h.ml?.elapsed_min ?? h.elapsed_min;
    return time != null ? time.toFixed(1) : (h.label || '');
  });
  
  const targets = ml?.targets || {};
  
  const createConfig = (id, label, targetKey, yTitle) => {
    const actual = history.map(h => h.ml?.current_sensors?.[id] ?? h.row?.[id]);
    const p50    = history.map(h => h.ml?.predicted_sensors?.[id]?.p50);
    // Widen visual bounds to ensure they are visible
    const p10    = history.map((h, i) => {
        const p = h.ml?.predicted_sensors?.[id];
        if (!p) return null;
        // Decrease uncertainty as we approach stability (funnel effect)
        const progress = Math.min(1, i / 200);
        const dynamicMargin = Math.max((p.p50 - p.p10) * 3, p.p50 * (0.04 - (0.03 * progress)));
        return p.p50 - dynamicMargin;
    });
    const p90    = history.map((h, i) => {
        const p = h.ml?.predicted_sensors?.[id];
        if (!p) return null;
        const progress = Math.min(1, i / 200);
        const dynamicMargin = Math.max((p.p90 - p.p50) * 3, p.p50 * (0.04 - (0.03 * progress)));
        return p.p50 + dynamicMargin;
    });
    
    // Annotations
    const ref = targets[id]?.ref;
    const std = targets[id]?.std;
    const annotations = {};
    if (ref != null) {
      if (std != null) {
        annotations.band = {
          type: 'box', yMin: ref - std * 2, yMax: ref + std * 2,
          backgroundColor: COLORS.BAND, borderWidth: 0
        };
      }
      annotations.ss = {
        type: 'line', yMin: ref, yMax: ref,
        borderColor: COLORS.SS_LINE, borderWidth: 1.5, borderDash: [6, 3],
        label: {
          display: true, content: `Steady state ${ref.toFixed(1)}`,
          position: 'end', font: { size: 10, family: INTER },
          backgroundColor: 'rgba(255,255,255,0.85)', color: COLORS.SS_LINE
        }
      };
    }

    return {
      data: {
        labels,
        datasets: [
          {
            label: `Actual ${label}`,
            data: actual,
            borderColor: COLORS.ACTUAL,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
            order: 1
          },
          {
            label: `Median (P50)`,
            data: p50,
            borderColor: COLORS.PRED_P50,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
            borderDash: [8, 4],
            fill: false,
            order: 2
          },
          {
            label: `Lower (P10)`,
            data: p10,
            borderColor: COLORS.PRED_PXX,
            borderWidth: 1,
            tension: 0.35,
            pointRadius: 0,
            borderDash: [4, 4],
            fill: false,
            order: 4
          },
          {
            label: `Upper (P90)`,
            data: p90,
            borderColor: COLORS.PRED_PXX,
            borderWidth: 1,
            tension: 0.35,
            pointRadius: 0,
            borderDash: [4, 4],
            fill: '-1', // Fill down to Lower (P10) dataset
            backgroundColor: 'rgba(109, 40, 217, 0.08)', // Shaded purple band
            order: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: { font: { size: 10, family: INTER }, usePointStyle: true, boxWidth: 6, boxHeight: 6, padding: 8 }
          },
          annotation: { annotations }
        },
        scales: {
          x: { 
            title: { display: true, text: 'Time (min)', font: { size: 10 }, color: COLORS.TEXT },
            grid: { color: COLORS.GRID, drawTicks: false },
            ticks: { maxTicksLimit: 12, font: { size: 9 }, color: COLORS.TEXT }
          },
          y: { 
            title: { display: true, text: yTitle, font: { size: 10 }, color: COLORS.TEXT },
            grid: { color: COLORS.GRID, drawTicks: false },
            ticks: { font: { size: 9 }, color: COLORS.TEXT },
            grace: '10%'
          }
        }
      }
    };
  };

  const fad = createConfig('fad_cfm', 'FAD', 'fad_cfm', 'FAD (CFM)');
  const temp = createConfig('airend_discharge_temp_c', 'Disc Temp', 'airend_discharge_temp_c', 'Disc Temp (°C)');
  const power = createConfig('motor_output_power_kw', 'Motor Power', 'motor_output_power_kw', 'Motor Power (kW)');

  return (
    <div style={{ 
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '8px', padding: '0 20px', marginBottom: '20px'
    }}>
      <ChartCard title="FAD Trajectory + Predicted Values">
        <Line data={fad.data} options={fad.options} />
      </ChartCard>
      <ChartCard title="Disc Temp Trajectory + Predicted Values">
        <Line data={temp.data} options={temp.options} />
      </ChartCard>
      <ChartCard title="Motor Power Trajectory + Predicted Values">
        <Line data={power.data} options={power.options} />
      </ChartCard>
    </div>
  );
}
