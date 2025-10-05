import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function AladinDome() {
  const domeRef = useRef();
  const [canvas, setCanvas] = useState(null);
  const textureRef = useRef();

  // 1️⃣ Grab the Aladin canvas dynamically from the DOM
  useEffect(() => {
    const checkCanvas = () => {
      const c = document.querySelector("#aladin-lite-div canvas");
      if (c) setCanvas(c);
      else requestAnimationFrame(checkCanvas);
    };
    checkCanvas();
  }, []);

  // 2️⃣ Create a Three.js texture once we have the canvas
  useEffect(() => {
    if (!canvas) return;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    textureRef.current = texture;

    if (domeRef.current) {
      domeRef.current.material.map = texture;
      domeRef.current.material.needsUpdate = true;
    }

    // 3️⃣ Update texture every 1 second
    const interval = setInterval(() => {
      if (textureRef.current) textureRef.current.needsUpdate = true;
    }, 1000); // 1000 ms = 1 update per second

    return () => clearInterval(interval);
  }, [canvas]);

  return (
    <mesh ref={domeRef}>
      {/* Full dome (hemisphere) */}
      <sphereGeometry args={[500, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
      <meshBasicMaterial side={THREE.BackSide} />
    </mesh>
  );
}

