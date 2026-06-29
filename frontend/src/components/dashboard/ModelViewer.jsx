import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'

const MONO = "'IBM Plex Mono', monospace"

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

function Overlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: '#C5D5CB', fontFamily: MONO,
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

      <Overlay />
    </div>
  )
}

useGLTF.preload('/model/motor.glb')
