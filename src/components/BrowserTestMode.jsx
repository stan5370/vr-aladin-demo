import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function TestSphere() {
  const meshRef = useRef();
  const [aladinTexture, setAladinTexture] = useState(null);

  useEffect(() => {
    // Create a test texture for browser testing
    const createTestTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      // Create a simple starfield pattern
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000011');
      gradient.addColorStop(1, '#000033');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add some constellation lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      setAladinTexture(texture);
    };

    createTestTexture();
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow rotation for demo
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[5, 64, 64]}>
      <meshStandardMaterial 
        map={aladinTexture}
        side={2} // DoubleSide for inside-out viewing
      />
    </Sphere>
  );
}

export default function BrowserTestMode() {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <TestSphere />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
        />
      </Canvas>
      
      {showInstructions && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '300px',
          zIndex: 1000
        }}>
          <h3>Browser Test Mode</h3>
          <p><strong>Controls:</strong></p>
          <p>• Mouse drag: Rotate view</p>
          <p>• Mouse wheel: Zoom in/out</p>
          <p>• Right-click drag: Pan</p>
          <p>• This simulates the VR experience</p>
          <button 
            onClick={() => setShowInstructions(false)}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Hide Instructions
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setShowInstructions(!showInstructions)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        {showInstructions ? 'Hide' : 'Show'} Instructions
      </button>
    </div>
  );
}
