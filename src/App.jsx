import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
// import { XR, createXRStore } from '@react-three/xr'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import Aladin from './components/aladin'

// const store = createXRStore()

function App() {
  const aladinRef = useRef();
  return (
    <>
      <Aladin ref={aladinRef} />
    </>
  )
}

export default App
