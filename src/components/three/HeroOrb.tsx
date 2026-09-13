import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import type { Mesh } from 'three'

function Orb() {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15
  })
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.4, 4]} />
        <MeshDistortMaterial
          color="#6D5CF6"
          emissive="#3B82F6"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.6}
          distort={0.35}
          speed={1.6}
        />
      </mesh>
    </Float>
  )
}

export default function HeroOrb() {
  return (
    <div className="h-full w-full" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={[1, 1.8]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[4, 3, 4]} intensity={1.4} color="#8B5CF6" />
          <pointLight position={[-4, -2, -3]} intensity={1} color="#22D3EE" />
          <Orb />
          <Sparkles count={60} scale={5} size={2} speed={0.3} color="#8B5CF6" />
        </Suspense>
      </Canvas>
    </div>
  )
}
