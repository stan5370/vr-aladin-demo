import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Html } from '@react-three/drei'
import Aladin from './components/aladin'

function App() {
  const store = createXRStore()

  return (
    <Canvas>
      <XR store={store}>
        <Html>
          <div onPointerDown={(e) => e.stopPropagation()}>
            <Aladin 
              target={"18 03 57.94 -28 40 55.0"}
              projection={"STG"}
              survey={"CDS/P/Mellinger/color"}
              fullScreen={true}
              showSimbadPointerControl={true}
              showReticle={false}
              fov={60}
              realFullscreen={true}
            />
          </div>
        </Html>
      </XR>
    </Canvas>
  )
}

export default App
