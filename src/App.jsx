import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Html, Environment, PerspectiveCamera } from '@react-three/drei'
import Aladin from './components/aladin'

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
                <PerspectiveCamera makeDefault position={[0, 1.6, 2]} fov={60} />
                <Environment preset="warehouse" />
                <mesh>
                    <sphereGeometry args={[5000, 16, 16, Math.PI / 2, Math.PI * 2, 0, Math.PI]} />
                    <meshStandardMaterial color="green" />
                </mesh>
                <mesh rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[6, 6]} />
                    <meshStandardMaterial color="white" />
                    <Html>
                        <Aladin />
                    </Html>
                </mesh>
                <XR store={store}>
                </XR>
            </Canvas>
        </>
    )
}

export default App
