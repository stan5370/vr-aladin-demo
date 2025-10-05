import { useEffect, useRef } from 'react'
import { Html } from '@react-three/drei'

export default function AladinScreen({ position }) {
  return (
    <group position={position}>
      <Html
        transform
        occlude
        distanceFactor={2}
        style={{
          width: '1400px',
          height: '900px',
          background: 'black'
        }}
      >
        <iframe
          src="https://aladin.cds.unistra.fr/AladinLite/?target=18+03+57.94+-28+40+55.0&fov=180&survey=CDS/P/Mellinger/color"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </Html>
    </group>
  )
}
