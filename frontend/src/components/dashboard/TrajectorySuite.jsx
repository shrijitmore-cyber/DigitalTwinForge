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
  Filler
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
  Filler,
  annotationPlugin
);

const MONO = "'IBM Plex Mono', monospace";

const ChartCard = ({ title, data, options, annotations, yTitle }) => {
  const finalOptions = {
    ...options,
    maintainAspectRatio: false,
    plugins: {
      ...options.plugins,
      annotation: { annotations }
    },
    scales: {
      ...options.scales,
      y: {
        ...options.scales.y,
        title: {
          display: true,
          text: yTitle,
          color: '#6B8075',
          font: { size: 10, family: MONO, weight: 600 }
        }
      }
    }
  };

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8E4', borderRadius: '8px',
      padding: '16px', flex: 1, minWidth: '380px', height: '340px',
      display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <div style={{ 
        fontSize: '10px', fontWeight: 700, color: '#334155', 
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span style={{ width: '3px', height: '10px', background: '#00A651', borderRadius: '10px' }}></span>
        {title}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <Line data={data} options={finalOptions} />
      </div>
    </div>
  );
};

export default function TrajectorySuite({ history, ml }) {
  if (!history || history.length === 0) return null;

  // Use elapsed_min for precise X-axis alignment matching the reference
  const labels = history.map(h => h.elapsed_min ? h.elapsed_min.toFixed(1) : h.label);
  const targets = ml?.targets || {};
  
  const createConfig = (id, label, color, targetKey, unit) => {
    const rawData = history.map(h => h[id]);
    const predData = history.map(h => h.ml_pred?.[targetKey] ?? null);
    
    const ref = targets[targetKey]?.ref;
    const std = targets[targetKey]?.std;
    
    const datasets = [
      {
        label: `Actual`,
        data: rawData,
        borderColor: color,
        backgroundColor: `${color}22`,
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.35,
        fill: false,
      },
      {
        label: `Predicted`,
        data: predData,
        borderColor: color,
        borderWidth: 2,
        borderDash: [8, 4],
        pointRadius: 0,
        tension: 0.35,
        fill: false,
      }
    ];

    const annotations = {};
    if (ref != null) {
      // Steady State Line
      annotations.ssLine = {
        type: 'line',
        yMin: ref,
        yMax: ref,
        borderColor: '#16A34A',
        borderWidth: 1.5,
        borderDash: [6, 3],
        label: {
          display: true,
          content: `Stable: ${ref.toFixed(1)} ${unit}`,
          position: 'end',
          backgroundColor: 'rgba(255,255,255,0.9)',
          color: '#16A34A',
          font: { size: 9, family: MONO, weight: 600 },
          padding: 4
        }
      };

      // Tolerance Band
      if (std && std > 0) {
        const band = std * 2;
        annotations.band = {
          type: 'box',
          yMin: ref - band,
          yMax: ref + band,
          backgroundColor: 'rgba(22, 163, 74, 0.05)',
          borderWidth: 0,
        };
      }
    }

    return { 
      data: { labels, datasets },
      annotations
    };
  };

  const commonOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12, boxHeight: 2, padding: 10,
          font: { size: 9, family: MONO, weight: 500 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 12,
        titleFont: { size: 10, family: MONO },
        bodyFont: { size: 12, family: MONO },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 4,
      }
    },
    scales: {
      x: { 
        display: true,
        title: {
          display: true,
          text: 'Time (min)',
          color: '#94A3B8',
          font: { size: 9, family: MONO }
        },
        grid: { color: 'rgba(226, 232, 240, 0.3)' },
        ticks: { 
            maxRotation: 0, autoSkip: true, maxTicksLimit: 8,
            color: '#94A3B8', font: { size: 9, family: MONO } 
        }
      },
      y: { 
        grace: '10%',
        grid: { color: 'rgba(226, 232, 240, 0.4)' },
        ticks: { color: '#94A3B8', font: { size: 10, family: MONO } }
      }
    }
  };

  const fad    = createConfig('fad_cfm', 'FAD', '#2563EB', 'fad_cfm', 'CFM');
  const temp   = createConfig('airend_discharge_temp_c', 'Temp', '#D97706', 'airend_discharge_temp_c', '°C');
  const power  = createConfig('motor_output_power_kw', 'Power', '#0891B2', 'motor_output_power_kw', 'kW');

  return (
    <div style={{ 
      display: 'flex', gap: '20px', padding: '0 20px', 
      marginBottom: '20px', overflowX: 'auto', paddingBottom: '12px'
    }}>
      <ChartCard 
        title="FAD Trajectory" 
        data={fad.data} 
        annotations={fad.annotations}
        yTitle="FAD (CFM)"
        options={commonOptions}
      />
      <ChartCard 
        title="Discharge Temp" 
        data={temp.data} 
        annotations={temp.annotations}
        yTitle="TEMP (°C)"
        options={commonOptions}
      />
      <ChartCard 
        title="Motor Power" 
        data={power.data} 
        annotations={power.annotations}
        yTitle="POWER (kW)"
        options={commonOptions}
      />
    </div>
  );
}
