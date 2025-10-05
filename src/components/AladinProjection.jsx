import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function AladinDome() {
  const domeRef = useRef();
  const [canvas, setCanvas] = useState(null);
  const textureRef = useRef();

  // Grab the Aladin canvas dynamically from the DOM
  useEffect(() => {
    const checkCanvas = () => {
      const c = document.querySelector("#aladin-lite-div canvas");
      if (c) setCanvas(c);
      else requestAnimationFrame(checkCanvas);
    };
    checkCanvas();
  }, []);

  // Create Three.js texture once we have the canvas
  useEffect(() => {
    if (!canvas) return;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    textureRef.current = texture;

    if (domeRef.current) {
      domeRef.current.material.map = texture;
      domeRef.current.material.color = new THREE.Color(0, 0, 0);
      domeRef.current.material.opacity = 85;
      domeRef.current.material.transparent = true;
      domeRef.current.material.needsUpdate = true;
    }

    // Update texture every 1 second
    const interval = setInterval(() => {
      if (textureRef.current) textureRef.current.needsUpdate = true;
    }, 1000);

    return () => clearInterval(interval);
  }, [canvas]);

  return (
    <mesh onClick={async (e) => {
      
      console.log("Clicked Mesh");

      const x = e.uv.x * canvas.width;
      const y = e.uv.y * canvas.height;

      const aladin = window.aladin;
      // console.log(aladin);
      
      const raDec = aladin.pix2world(x, y); // TODO: make this work

      console.log(raDec);

      aladin.gotoObject(raDec); // TODO: make this work
      console.log(aladin.getRaDec());



      // console.log("RA:", source.data.ra_sexa);
      // console.log("Declination:", source.data.dec_sexa);

      // const prefix = "http://localhost:7071/api/";

      // let params = new URLSearchParams({ RA: source.data.ra_sexa, Declination: source.data.dec_sexa});
      // let url = prefix + `coordsToName?${params.toString()}`;

      // let res = await fetch(url);
      // let text = await res.text();
      // console.log(text);

      // params = new URLSearchParams({prompt: text});
      // url = prefix + `namesToDesc?${params.toString()}`;
      // res = await fetch(url);
      // let description = await res.text();
      // console.log(description);

    }} ref={domeRef}>
      <sphereGeometry args={[1500, 128, 64, 0, Math.PI * 2, 0]} />
      <meshBasicMaterial side={THREE.BackSide} color="black" />
    </mesh>
  );
}

