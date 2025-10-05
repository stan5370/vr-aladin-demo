import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Html } from '@react-three/drei'
import Aladin from './components/aladin'

function App() {
  const store = createXRStore()
  return (
    <>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <Canvas style={{ width: '100vw', height: '100vh' }}>
        <XR store={store}>
          {/* Add some 3D content for VR */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {/* A simple ground plane so you can see something in VR */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          
          {/* A floating screen with Aladin in front of you */}
          <mesh position={[0, 1.6, -2]}>
            <planeGeometry args={[3, 2]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          
          <Html
            transform
            distanceFactor={1.5}
            position={[0, 1.6, -2]}
            style={{
              width: '1200px',
              height: '800px'
            }}
          >
            <Aladin 
              target={"18 03 57.94 -28 40 55.0"}
              projection={"STG"}
              survey={"CDS/P/Mellinger/color"}
              showSimbadPointerControl={true}
              showReticle={false}
              fov={180}
            />
          </Html>
        </XR>
      </Canvas>
    </>
  )
}

export default App
