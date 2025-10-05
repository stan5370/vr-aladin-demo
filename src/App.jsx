import * as THREE from "three"
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Html, Environment, PerspectiveCamera } from '@react-three/drei'
import Aladin from './components/aladin'

const store = createXRStore()

function App() {
    return (
        <>
            <Canvas
                style={{
                    position: "fixed",
                    width: "100vw",
                    height: "100vh",
                }}
            >
                <XR store={store}>
                    <PerspectiveCamera makeDefault position={[0, 1.6, 2]} fov={60} />
                    <Environment preset="warehouse" />
                    <mesh>
                        <sphereGeometry args={[50, 32, 16, Math.PI / 2, Math.PI * 2, 0, Math.PI]} />
                        <meshStandardMaterial side={THREE.DoubleSide} />
                        <Html position={[0, -0.1, 0]} transform>
                            <Aladin />
                        </Html>
                    </mesh>
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
