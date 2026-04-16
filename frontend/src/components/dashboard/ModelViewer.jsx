import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'

// Shared design tokens (match RightPanel/Header)
const MONO = "'IBM Plex Mono', monospace"
const BORDER = '1px solid #E2E8E4'
const CARD_BG = 'rgba(255,255,255,0.92)'
const GREEN = '#00A651'

const f1 = v => (v == null || isNaN(v)) ? '--.-' : Number(v).toFixed(1)
const f2 = v => (v == null || isNaN(v)) ? '-.-'  : Number(v).toFixed(2)

const ALERT_COLOR = { hot: '#E53E00', warm: '#D97706', warn: '#CA8A04', alert: '#DC2626', ok: '#0A1A10' }

function CompressorModel({ frame }) {
  const { scene } = useGLTF('/model/motor.glb')
  const ref = useRef()
  const d = frame?.display ?? {}
  const running = d.fan_status === 'RUNNING'
  const warming = d.fan_status === 'WARMING'

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * (running ? 0.08 : warming ? 0.04 : 0.01)
  })

  return <primitive ref={ref} object={scene} scale={0.04} position={[0, -0.5, 0]} />
}

// Single data card — matches RightPanel metric style exactly
function Card({ label, value, unit, accentColor, alertStatus }) {
  const valueColor = ALERT_COLOR[alertStatus] ?? '#FFFFFF'
  return (
    <div style={{
      fontFamily: MONO,
      background: CARD_BG,
      border: BORDER,
      borderLeft: `2px solid ${accentColor ?? GREEN}`,
      padding: '6px 12px',
      backdropFilter: 'blur(8px)',
      minWidth: 130,
      boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase',
        color: '#9BB5A5', marginBottom: '4px',
        fontWeight: 600,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600, color: valueColor }}>{value}</span>
        {unit && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{unit}</span>}
      </div>
    </div>
  )
}

// Status pill — matches Header phase badge style
function StatusPill({ label, value, color }) {
  return (
    <div style={{
      fontFamily: MONO, fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '4px 12px',
      border: `1px solid ${color}55`,
      color,
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    }}>
      {label && <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: 6 }}>{label}</span>}
      {value}
    </div>
  )
}

function Overlay({ frame }) {
  const row = frame?.row ?? {}
  const d   = frame?.display ?? {}
  const h   = frame?.health?.alerts ?? []
  const alertStatus = field => h.find(a => a.field === field)?.status ?? 'ok'

  const phase = d.phase_label ?? 'IDLE'
  const fanSt = d.fan_status  ?? 'STANDBY'
  const fanColor = { RUNNING: GREEN, WARMING: '#D97706', STANDBY: '#AAB5AD' }[fanSt]

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: MONO }}>

      {/* Top-left: phase + fan status */}
      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <StatusPill value={phase} color={GREEN} />
        <StatusPill label="FAN" value={fanSt} color={fanColor} />
      </div>

      {/* Top-right: discharge + pressure */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <Card
          label="Discharge Temp"
          value={f1(row.airend_discharge_temp_c)}
          unit="°C"
          accentColor={ALERT_COLOR[alertStatus('airend_discharge_temp_c')] === '#FFFFFF' ? GREEN : ALERT_COLOR[alertStatus('airend_discharge_temp_c')]}
          alertStatus={alertStatus('airend_discharge_temp_c')}
        />
        <Card
          label="Delivery Pressure"
          value={f2(row.delivery_pressure_kg_cm2g)}
          unit="kg/cm²"
          accentColor={GREEN}
          alertStatus={alertStatus('delivery_pressure_kg_cm2g')}
        />
      </div>

      {/* Bottom-left: FAD + motor */}
      <div style={{ position: 'absolute', bottom: 36, left: 12, display: 'flex', gap: 6 }}>
        <Card
          label="FAD Output"
          value={f1(row.fad_cfm)}
          unit="CFM"
          accentColor={GREEN}
          alertStatus={alertStatus('fad_cfm')}
        />
        <Card
          label="Motor Output"
          value={f1(row.motor_output_power_kw)}
          unit="kW"
          accentColor={GREEN}
          alertStatus="ok"
        />
      </div>

      {/* Bottom-right: cooler temps */}
      <div style={{ position: 'absolute', bottom: 36, right: 12, display: 'flex', gap: 6 }}>
        <Card
          label="Oil Cooler In"
          value={f1(row.oil_cooler_inlet_temp_c)}
          unit="°C"
          accentColor="#f6a820"
          alertStatus={alertStatus('oil_cooler_inlet_temp_c')}
        />
        <Card
          label="After Cooler Out"
          value={f1(row.aftercooler_outlet_temp_c)}
          unit="°C"
          accentColor="#34D17A"
          alertStatus="ok"
        />
      </div>

      {/* Bottom-centre: hint */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: '#C5D5CB',
        fontFamily: MONO,
      }}>
        DRAG TO ROTATE
      </div>
    </div>
  )
}

export default function ModelViewer({ frame }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#F4F7F5' }}>
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#F0F4F2']} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]}  intensity={1.2} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.35} color="#00A651" />
        <pointLight       position={[0, 5, 0]}   intensity={0.5}  color="#34D17A" />

        <Suspense fallback={null}>
          <CompressorModel frame={frame} />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={6} blur={2} far={2} />
          <Environment preset="warehouse" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableRotate={true}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          makeDefault
        />
      </Canvas>

      <Overlay frame={frame} />
    </div>
  )
}

useGLTF.preload('/model/motor.glb')
