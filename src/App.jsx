import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import Aladin from './components/aladin'
import AladinDome from './components/AladinProjection'

const store = createXRStore()

function App() {
  const aladinRef = useRef();
  return (
    <>
      <Aladin ref={aladinRef} />
      <Canvas
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
        }}
      >
        <XR store={store}>
          <PerspectiveCamera makeDefault position={[0, 1.6, 0]} fov={75} />
          <Environment preset="night" />
          <AladinDome ref={aladinRef} />
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[2, 32]} transform={[0, -5, 0]} />
            <meshStandardMaterial transparent={true} opacity={0.5} color="gray" />
          </mesh>
        </XR>
      </Canvas>
    </>
  )
}

export default App
