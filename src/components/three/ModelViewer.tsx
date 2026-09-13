import { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { useLoader } from '@react-three/fiber'
import type { Model3DFormat } from '@/types'

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function OBJModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url)
  return <primitive object={obj} />
}

interface Props {
  url: string
  format: Model3DFormat
  className?: string
}

export default function ModelViewer({ url, format, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)

  function toggleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative h-full w-full bg-void-900 ${className}`}>
      <Canvas camera={{ position: [3, 2, 3], fov: 45 }} dpr={[1, 1.8]}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} shadows="contact">
            {format === 'obj' ? <OBJModel url={url} /> : <GLTFModel url={url} />}
          </Stage>
          <OrbitControls enablePan makeDefault autoRotate autoRotateSpeed={0.6} />
        </Suspense>
      </Canvas>
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 badge hover:text-white hover:border-white/30 transition-colors"
        aria-label={fullscreen ? 'Exit fullscreen' : 'View fullscreen'}
      >
        {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      </button>
    </div>
  )
}
