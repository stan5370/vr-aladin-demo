import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import Aladin from './components/aladin'
import AladinDome from './components/AladinProjection'

const store = createXRStore()

function App() {
  return (
    <>
      <Aladin />
      <Canvas
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
        }}
      >
        <XR store={store}>
          <PerspectiveCamera makeDefault position={[0, 1.6, 2]} fov={60} />
          <Environment preset="night" />
          <AladinDome />
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[2.5, 32]} />
            <meshStandardMaterial color="gray" />
          </mesh>
        </XR>
      </Canvas>
    </>
  )
}

export default App
