import { useEffect, useRef } from 'react'
import {
  Chart, LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Filler, Tooltip,
} from 'chart.js'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip)

const WINDOW = 60
const MONO = "'IBM Plex Mono', monospace"

const CHARTS = [
  {
    key: 'airend',
    dataKey: 'airend_discharge_temp_c',
    label: 'Airend Temp',
    color: '#00A651', unit: '°C',
    refs: [
      { y: 65, color: 'rgba(217,119,6,0.6)',  dash: [5,4], label: 'WARN 65' },
      { y: 88, color: 'rgba(220,38,38,0.6)',  dash: [5,4], label: 'CRIT 88' },
    ],
  },
  {
    key: 'fad',
    dataKey: 'fad_cfm',
    label: 'FAD Output',
    color: '#059669', unit: 'CFM',
    refs: [{ y: 120, color: 'rgba(217,119,6,0.55)', dash: [5,4], label: 'MAX 120' }],
  },
  {
    key: 'motor',
    dataKey: 'motor_output_power_kw',
    label: 'Motor Power',
    color: '#0891B2', unit: 'kW',
    refs: [],
  },
  {
    key: 'tol_flow',
    dataKey: 'tolerance_flow_pct',
    label: 'Flow Tolerance',
    color: '#D97706', unit: '%',
    refs: [
      { y: 0,  color: 'rgba(0,0,0,0.18)',    dash: [3,3] },
      { y: 12, color: 'rgba(217,119,6,0.6)', dash: [5,4], label: 'LIM 12' },
    ],
  },
  {
    key: 'tol_spc',
    dataKey: 'tolerance_spc_pct',
    label: 'SPC Tolerance',
    color: '#7C3AED', unit: '%',
    refs: [
      { y: -8, color: 'rgba(124,58,237,0.5)', dash: [5,4], label: 'LO -8' },
      { y:  5, color: 'rgba(124,58,237,0.5)', dash: [5,4], label: 'HI 5'  },
      { y:  0, color: 'rgba(0,0,0,0.18)',     dash: [3,3] },
    ],
  },
  {
    key: 'spc',
    dataKey: 'spc_kw_per_m3_min',
    label: 'Spec. Power',
    color: '#0E7490', unit: 'kW/m³/min',
    refs: [],
  },
]

function makeGradient(ctx, chartArea, color) {
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0,   color + '50')
  g.addColorStop(0.6, color + '18')
  g.addColorStop(1,   color + '00')
  return g
}

function TrendArrow({ history, dataKey }) {
  if (history.length < 2) return null
  const recent = history.slice(-10)
  const first  = (recent[0]?.row?.[dataKey] ?? recent[0]?.[dataKey])
  const last   = (recent[recent.length - 1]?.row?.[dataKey] ?? recent[recent.length - 1]?.[dataKey])
  if (first == null || last == null) return null
  const delta = last - first
  const pct   = first !== 0 ? Math.abs((delta / Math.abs(first)) * 100).toFixed(1) : '0.0'
  const up    = delta >= 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '2px',
      fontFamily: MONO, fontSize: '9px', fontWeight: 600,
      color: up ? '#D97706' : '#059669',
    }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        {up
          ? <path d="M4 7V1M1 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M4 1v6M1 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
      {pct}%
    </span>
  )
}

function MiniChart({ cfg, history }) {
  const canvasRef   = useRef(null)
  const chartRef    = useRef(null)
  const processedRef = useRef(0)

  // Init chart once
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            borderColor: cfg.color,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: cfg.color,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            fill: 'origin',
            backgroundColor(context) {
              const { ctx: c, chartArea } = context.chart
              if (!chartArea) return cfg.color + '20'
              return makeGradient(c, chartArea, cfg.color)
            },
            tension: 0.4,
            order: 1,
            clip: false,
          },
          ...(cfg.refs ?? []).map(ref => ({
            data: [],
            borderColor: ref.color,
            borderWidth: 1.2,
            borderDash: ref.dash ?? [5, 4],
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 0,
          })),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(10,26,16,0.92)',
            titleColor: '#9BB5A5',
            bodyColor: '#FFFFFF',
            borderColor: cfg.color + '60',
            borderWidth: 1,
            padding: { x: 10, y: 7 },
            titleFont:  { family: MONO, size: 8,  weight: '600' },
            bodyFont:   { family: MONO, size: 12, weight: '700' },
            displayColors: false,
            filter: item => item.datasetIndex === 0,
            callbacks: {
              title:      items  => items[0]?.label ?? '',
              label:      item   => `${Number(item.raw).toFixed(cfg.unit === 'kW/m³/min' ? 2 : 1)} ${cfg.unit}`,
              afterLabel: ()     => null,
            },
          },
        },
        scales: {
          x: { display: false },
          y: {
            border: { display: false },
            grid: { color: 'rgba(0,0,0,0.05)', lineWidth: 1 },
            ticks: {
              color: '#A8BFB0',
              font: { family: MONO, size: 8 },
              maxTicksLimit: 4,
              padding: 6,
              callback: v => cfg.unit === 'kW/m³/min' ? Number(v).toFixed(1) : v,
            },
          },
        },
      },
    })
    processedRef.current = 0
    return () => { chartRef.current?.destroy(); processedRef.current = 0 }
  }, [])

  // Append-only updates — push new points, shift old ones
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    // Reset on seek/clear
    if (history.length === 0) {
      chart.data.labels = []
      chart.data.datasets.forEach(ds => { ds.data = [] })
      processedRef.current = 0
      chart.update('none')
      return
    }

    const newEntries = history.slice(processedRef.current)
    if (!newEntries.length) return

    newEntries.forEach(h => {
      chart.data.labels.push(h.label)
      const val = h.row?.[cfg.dataKey] ?? h[cfg.dataKey]
      chart.data.datasets[0].data.push(val ?? null)
      ;(cfg.refs ?? []).forEach((ref, i) => {
        chart.data.datasets[i + 1].data.push(ref.y)
      })
    })

    // Rolling window — trim front
    while (chart.data.labels.length > WINDOW) {
      chart.data.labels.shift()
      chart.data.datasets.forEach(ds => ds.data.shift())
    }

    processedRef.current = history.length
    chart.update('none')
  }, [history])

  const hLast   = history.length ? history[history.length - 1] : null
  const latest  = hLast?.row?.[cfg.dataKey] ?? hLast?.[cfg.dataKey]
  const display = latest != null ? Number(latest).toFixed(cfg.unit === 'kW/m³/min' ? 2 : 1) : '--'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: '#FFFFFF',
      border: '1px solid #EEF2EF',
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: '6px',
      padding: '14px 14px 10px',
      overflow: 'hidden', height: '200px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{
            fontFamily: MONO, fontSize: '9px', fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: '#A8BFB0',
          }}>
            {cfg.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{
              fontFamily: MONO, fontSize: '22px', fontWeight: 700,
              color: cfg.color, lineHeight: 1, letterSpacing: '-0.02em',
            }}>
              {display}
            </span>
            <span style={{ fontFamily: MONO, fontSize: '9px', color: '#A8BFB0', fontWeight: 500 }}>
              {cfg.unit}
            </span>
          </div>
        </div>
        <TrendArrow history={history} dataKey={cfg.dataKey} />
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Ref legend */}
      {cfg.refs?.some(r => r.label) && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
          {cfg.refs.filter(r => r.label).map((r, i) => (
            <span key={i} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontFamily: MONO, fontSize: '7px', letterSpacing: '0.1em',
              color: '#A8BFB0', textTransform: 'uppercase',
            }}>
              <span style={{ display: 'inline-block', width: 12, height: 1.5, background: r.color, borderRadius: 1 }} />
              {r.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChartStrip({ history }) {
  return (
    <div style={{ padding: '16px 16px 20px', background: '#F4F7F5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{
          fontFamily: MONO, fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8BFB0',
        }}>
          Live Telemetry
        </span>
        <div style={{ flex: 1, height: '1px', background: '#EEF2EF' }} />
        <span style={{ fontFamily: MONO, fontSize: '8px', color: '#C5D5CB', letterSpacing: '0.1em' }}>
          {WINDOW}s window
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {CHARTS.map(cfg => (
          <MiniChart key={cfg.key} cfg={cfg} history={history} />
        ))}
      </div>
    </div>
  )
}
