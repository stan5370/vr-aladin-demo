import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

export default function AladinDome() {
  const domeRef = useRef();
  const textureRef = useRef();
  const { camera } = useThree();

  // Grab the Aladin canvas dynamically
  useEffect(() => {
    let raf;
    const waitForCanvas = () => {
      const c = document.querySelector("#aladin-lite-div canvas");
      if (c) {
        const tex = new THREE.CanvasTexture(c);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.colorSpace = THREE.SRGBColorSpace; // better color
        tex.flipY = true;                      // typical for CanvasTexture
        textureRef.current = tex;

        if (domeRef.current) {
          const mat = domeRef.current.material;
          mat.map = tex;
          mat.color.set(0xffffff);   // don’t dim the texture
          mat.transparent = false;
          mat.opacity = 1;           // range 0..1
          mat.needsUpdate = true;
        }
      } else {
        raf = requestAnimationFrame(waitForCanvas);
      }
    };
    waitForCanvas();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keep dome centered on the head and refresh texture
  useFrame(() => {
    if (domeRef.current) domeRef.current.position.copy(camera.position);
    if (textureRef.current) textureRef.current.needsUpdate = true;
  });

  return (
    <mesh
      ref={domeRef}
      onClick={(e) => {
        const aladin = window.aladin;            // must be your A.aladin(...) instance
        if (!aladin) return console.warn("Aladin instance not ready");
        const canvas = document.querySelector("#aladin-lite-div canvas");
        if (!canvas) return console.warn("Aladin canvas not found");

        // UV from R3F: (0,0) bottom-left. Aladin pixels: (0,0) top-left.
        const u = e.uv?.x ?? 0.5;
        const v = e.uv?.y ?? 0.5;

        // Use backing-store size (includes devicePixelRatio)
        const px = u * canvas.width;
        const py = (1 - v) * canvas.height; // flip Y for top-left origin

        // Map to sky coords & move Aladin’s view
        const [ra, dec] = aladin.pix2world(px, py);
        if (Number.isFinite(ra) && Number.isFinite(dec)) {
          aladin.gotoRaDec(ra, dec);
          console.log("RA/Dec ->", ra, dec);
        } else {
          console.warn("pix2world returned invalid coords", [ra, dec]);
        }
      }}
    >
      {/* big sphere, inside-out, no parallax */}
      <sphereGeometry args={[1000, 128, 64]} />
      <meshBasicMaterial side={THREE.BackSide} color="black" depthWrite={false} />
    </mesh>
  );
}
