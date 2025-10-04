import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import Aladin from './components/aladin'

const store = createXRStore()

function App() {
  return (
    <>
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
      <Canvas>
        <XR store={store}>
        </XR>
      </Canvas>
    </>
  )}

export default App
