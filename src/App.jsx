import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import Aladin from './components/aladin'
import ReactDOM from 'react-dom/client'

const store = createXRStore()

function AladinBackground({ aladinProps }) {
  const meshRef = useRef()
  const { camera } = useThree()
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    // Create a canvas texture
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const tex = new THREE.CanvasTexture(canvas)
    setTexture(tex)

    // Mount Aladin temporarily to render into canvas
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    root.render(<Aladin {...aladinProps} />)

    // Copy Aladin's internal canvas to our texture continuously
    const updateTexture = () => {
      const aladinCanvas = container.querySelector('canvas')
      if (aladinCanvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(aladinCanvas, 0, 0, canvas.width, canvas.height)
        tex.needsUpdate = true
      }
      requestAnimationFrame(updateTexture)
    }
    updateTexture()

    return () => {
      root.unmount()
      document.body.removeChild(container)
    }
  }, [aladinProps])

  // Keep plane fixed relative to camera
  useFrame(() => {
    if (meshRef.current) {
      const distance = 1
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      meshRef.current.position.copy(camera.position).add(dir.multiplyScalar(distance))
      meshRef.current.quaternion.copy(camera.quaternion)
    }
  })

  if (!texture) return null

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

export default function App() {
  const aladinProps = {
    target: "18 03 57.94 -28 40 55.0",
    projection: "STG",
    survey: "CDS/P/Mellinger/color",
    fullScreen: true,
    showSimbadPointerControl: true,
    showReticle: false,
    fov: 60,
    realFullscreen: true
  }

  return (
    <Canvas>
      <XR store={store}>
        <AladinBackground aladinProps={aladinProps} />
      </XR>
    </Canvas>
  )
}

