// import { useRef, useMemo } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
// import { OrbitControls, Stars } from '@react-three/drei'
// import * as THREE from 'three'
// import { Text } from '@react-three/drei'


// function RealisticSun({ size = 100, color = [1.0, 0.4, 0.0] }) {
//   const sunRef = useRef()
//   const glowRef = useRef()
//   const fresnelRef = useRef()
  
//   const sunMaterial = useMemo(() => {
//     return new THREE.ShaderMaterial({
//       uniforms: {
//         u_time: { value: 0 },
//         u_color: { value: new THREE.Vector3(...color) }
//       },
//       vertexShader: `
//         varying vec2 vUv;
//         varying vec3 vNormal;
//         varying vec3 vNormalModel;
//         varying vec3 vNormalView;
//         varying vec3 vPosition;
        
//         void main() {
//           vUv = uv;
//           vNormal = normalize(mat3(modelMatrix) * normal);
//           vNormalModel = normal;
//           vNormalView = normalize(normalMatrix * normal);
//           vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         #define NUM_OCTAVES 6
        
//         uniform float u_time;
//         uniform vec3 u_color;
//         varying vec2 vUv;
//         varying vec3 vPosition;
//         varying vec3 vNormalView;
        
//         float random (in vec3 st) {
//           return fract(sin(dot(st,vec3(12.9898,78.233,23.112)))*12943.145);
//         }
        
//         float noise (in vec3 _pos) {
//           vec3 i_pos = floor(_pos);
//           vec3 f_pos = fract(_pos);
//           float i_time = floor(u_time*0.2);
//           float f_time = fract(u_time*0.2);
          
//           float aa = random(i_pos + i_time);
//           float ab = random(i_pos + i_time + vec3(1., 0., 0.));
//           float ac = random(i_pos + i_time + vec3(0., 1., 0.));
//           float ad = random(i_pos + i_time + vec3(1., 1., 0.));
//           float ae = random(i_pos + i_time + vec3(0., 0., 1.));
//           float af = random(i_pos + i_time + vec3(1., 0., 1.));
//           float ag = random(i_pos + i_time + vec3(0., 1., 1.));
//           float ah = random(i_pos + i_time + vec3(1., 1., 1.));
          
//           float ba = random(i_pos + (i_time + 1.));
//           float bb = random(i_pos + (i_time + 1.) + vec3(1., 0., 0.));
//           float bc = random(i_pos + (i_time + 1.) + vec3(0., 1., 0.));
//           float bd = random(i_pos + (i_time + 1.) + vec3(1., 1., 0.));
//           float be = random(i_pos + (i_time + 1.) + vec3(0., 0., 1.));
//           float bf = random(i_pos + (i_time + 1.) + vec3(1., 0., 1.));
//           float bg = random(i_pos + (i_time + 1.) + vec3(0., 1., 1.));
//           float bh = random(i_pos + (i_time + 1.) + vec3(1., 1., 1.));
          
//           vec3 t = smoothstep(0., 1., f_pos);
//           float t_time = smoothstep(0., 1., f_time);
          
//           return mix(
//             mix(
//               mix(mix(aa,ab,t.x), mix(ac,ad,t.x), t.y),
//               mix(mix(ae,af,t.x), mix(ag,ah,t.x), t.y),
//               t.z),
//             mix(
//               mix(mix(ba,bb,t.x), mix(bc,bd,t.x), t.y),
//               mix(mix(be,bf,t.x), mix(bg,bh,t.x), t.y),
//               t.z),
//             t_time);
//         }
        
//         float fBm (in vec3 _pos, in float sz) {
//           float v = 0.0;
//           float a = 0.2;
//           _pos *= sz;
//           vec3 angle = vec3(-0.001*u_time, 0.0001*u_time, 0.0004*u_time);
//           mat3 rotx = mat3(1, 0, 0,
//                           0, cos(angle.x), -sin(angle.x),
//                           0, sin(angle.x), cos(angle.x));
//           mat3 roty = mat3(cos(angle.y), 0, sin(angle.y),
//                           0, 1, 0,
//                           -sin(angle.y), 0, cos(angle.y));
//           mat3 rotz = mat3(cos(angle.z), -sin(angle.z), 0,
//                           sin(angle.z), cos(angle.z), 0,
//                           0, 0, 1);
//           for (int i = 0; i < NUM_OCTAVES; ++i) {
//             v += a * noise(_pos);
//             _pos = rotx * roty * rotz * _pos * 2.0;
//             a *= 0.8;
//           }
//           return v;
//         }
        
//         void main() {
//           vec3 st = vPosition;
//           vec3 q = vec3(0.);
//           q.x = fBm(st, 5.);
//           q.y = fBm(st + vec3(1.2,3.2,1.52), 5.);
//           q.z = fBm(st + vec3(0.02,0.12,0.152), 5.);
//           float n = fBm(st+q+vec3(1.82,1.32,1.09), 5.);
//           vec3 color = vec3(0.);
//           color = mix(vec3(1.,0.4,0.), vec3(1.,1.,1.), n*n);
//           color = mix(color, vec3(1.,0.,0.), q*0.7);
//           gl_FragColor = vec4(1.6*color, 1.);
//         }
//       `
//     })
//   }, [color])
  
//   const glowMaterial = useMemo(() => {
//     return new THREE.ShaderMaterial({
//       uniforms: {
//         u_time: { value: 0 },
//         u_color: { value: new THREE.Vector3(...color) }
//       },
//       transparent: true,
//       side: THREE.BackSide,
//       blending: THREE.AdditiveBlending,
//       vertexShader: `
//         varying vec2 vUv;
//         varying vec3 vNormalView;
//         varying vec3 vPosition;
        
//         void main() {
//           vUv = uv;
//           vNormalView = normalize(normalMatrix * normal);
//           vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         uniform vec3 u_color;
//         varying vec3 vPosition;
//         varying vec3 vNormalView;
        
//         void main() {
//           float raw_intensity = max(dot(vPosition, vNormalView), 0.);
//           float intensity = pow(raw_intensity, 4.);
//           vec4 color = vec4(u_color, intensity);
//           gl_FragColor = color;
//         }
//       `
//     })
//   }, [color])
  
//   const fresnelMaterial = useMemo(() => {
//     return new THREE.ShaderMaterial({
//       uniforms: {
//         u_time: { value: 0 },
//         u_color: { value: new THREE.Vector3(...color) }
//       },
//       transparent: true,
//       blending: THREE.AdditiveBlending,
//       vertexShader: `
//         varying vec2 vUv;
//         varying vec3 vNormalView;
//         varying vec3 vPosition;
        
//         void main() {
//           vUv = uv;
//           vNormalView = normalize(normalMatrix * normal);
//           vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         uniform vec3 u_color;
//         varying vec3 vPosition;
//         varying vec3 vNormalView;
        
//         void main() {
//           float fresnelTerm_inner = 0.2 - 0.7*min(dot(vPosition, vNormalView), 0.0);
//           fresnelTerm_inner = pow(fresnelTerm_inner, 5.0);
//           float fresnelTerm_outer = 1.0 + dot(normalize(vPosition), normalize(vNormalView));
//           fresnelTerm_outer = pow(fresnelTerm_outer, 2.0);
//           float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;
//           gl_FragColor = vec4(u_color, 0.7) * fresnelTerm;
//         }
//       `
//     })
//   }, [color])
  
//   useFrame((state) => {
//     sunMaterial.uniforms.u_time.value = state.clock.elapsedTime
//     glowMaterial.uniforms.u_time.value = state.clock.elapsedTime
//     fresnelMaterial.uniforms.u_time.value = state.clock.elapsedTime
    
//     if (sunRef.current) {
//       sunRef.current.rotation.y += 0.001
//     }
//   })
  
//   return (
//     <group>
//       {/* Main sun surface */}
//       <mesh ref={sunRef} material={sunMaterial}>
//         <sphereGeometry args={[size, 128, 128]} />
//       </mesh>
      
//       {/* Glow layer */}
//       <mesh ref={glowRef} material={glowMaterial} scale={1.2}>
//         <sphereGeometry args={[size, 64, 64]} />
//       </mesh>
      
//       {/* Fresnel layer */}
//       <mesh ref={fresnelRef} material={fresnelMaterial}>
//         <sphereGeometry args={[size, 64, 64]} />
//       </mesh>
      
//       {/* Point light */}
//       <pointLight color={new THREE.Color(...color)} intensity={5} distance={100} />
//     </group>
//   )
// }

// function Planet({ distance, size, color, speed = 0.2 }) {
//   const meshRef = useRef()
  
//   useFrame((state) => {
//     if (meshRef.current) {
//       const angle = state.clock.elapsedTime * speed
//       meshRef.current.position.x = Math.cos(angle) * distance
//       meshRef.current.position.z = Math.sin(angle) * distance
//       meshRef.current.rotation.y += 0.01
//     }
//   })
  
//   return (
//     <mesh ref={meshRef}>
//       <sphereGeometry args={[size, 32, 32]} />
//       <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
//     </mesh>
//   )
// }

// export default function RealisticSunSystem() {
//   return (
//     <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
//       <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
//         <color attach="background" args={['#000']} />
//         <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} />
//          <Text
//     position={[0, 8, 0]}
//     fontSize={2}
//     color="white"
//     anchorX="center"
//     anchorY="middle"
//   >
//     Solar System
//   </Text>
//         <ambientLight intensity={0.05} />
//         <OrbitControls 
//           enablePan={true}
//           enableZoom={true}
//           minDistance={5}
//           maxDistance={50}
//         />
        
//         {/* Realistic Sun */}
//         <RealisticSun size={5} color={[1.0, 0.4, 0.0]} />
        
//         {/* Earth-like planet */}
//         <Planet distance={7} size={0.4} color="#ffffff" speed={0.3} />
        
//         {/* Mars-like planet */}
//         <Planet distance={10} size={0.3} color="#ffffff" speed={0.2} />
        
//         {/* Gas giant */}
//         <Planet distance={14} size={0.8} color="#ffffff" speed={0.1} />
//       </Canvas>
      
//       <div style={{
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         color: 'white',
//         background: 'rgba(0,0,0,0.85)',
//         padding: '20px',
//         borderRadius: '10px',
//         fontFamily: 'system-ui, -apple-system, sans-serif',
//         fontSize: '14px',
//         maxWidth: '300px'
//       }}>
//       </div>
//     </div>
//   )
// }
// import React, { useEffect, useRef } from "react";

// export default function SolarSystem2D() {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     let width = window.innerWidth;
//     let height = window.innerHeight;
//     canvas.width = width;
//     canvas.height = height;

//     const centerX = width / 2;
//     const centerY = height / 2;

//     const planets = [
//       { color: "#4A90E2", radius: 100, size: 6, speed: 0.02 }, // Earth
//       { color: "#D35400", radius: 160, size: 5, speed: 0.015 }, // Mars
//       { color: "#F1C40F", radius: 250, size: 10, speed: 0.008 }, // Jupiter
//       { color: "#A569BD", radius: 320, size: 8, speed: 0.006 }, // Saturn
//     ];

//     let time = 0;

//     function drawSun() {
//       const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
//       gradient.addColorStop(0, "#FFDD00");
//       gradient.addColorStop(1, "#FF6600");
//       ctx.fillStyle = gradient;
//       ctx.beginPath();
//       ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
//       ctx.fill();
//     }

//     function drawPlanet(planet, angle) {
//       const x = centerX + planet.radius * Math.cos(angle);
//       const y = centerY + planet.radius * Math.sin(angle);

//       // orbit path
//       ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
//       ctx.beginPath();
//       ctx.arc(centerX, centerY, planet.radius, 0, Math.PI * 2);
//       ctx.stroke();

//       // planet
//       ctx.beginPath();
//       ctx.fillStyle = planet.color;
//       ctx.arc(x, y, planet.size, 0, Math.PI * 2);
//       ctx.fill();
//     }

//     function animate() {
//       ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
//       ctx.fillRect(0, 0, width, height);

//       drawSun();

//       planets.forEach((planet, i) => {
//         const angle = time * planet.speed;
//         drawPlanet(planet, angle);
//       });

//       time += 1;
//       requestAnimationFrame(animate);
//     }

//     animate();

//     const handleResize = () => {
//       width = window.innerWidth;
//       height = window.innerHeight;
//       canvas.width = width;
//       canvas.height = height;
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div style={{ background: "#000", width: "100vw", height: "100vh" }}>
//       <canvas ref={canvasRef} style={{ display: "block" }} />
//       <div
//         style={{
//           position: "absolute",
//           top: 20,
//           left: 20,
//           color: "white",
//           background: "rgba(0,0,0,0.7)",
//           padding: "10px 20px",
//           borderRadius: "8px",
//           fontFamily: "system-ui, sans-serif",
//         }}
//       >
//         <h3>2D Solar System</h3>
//         <p>Planets orbit the sun in real time.</p>
//       </div>
//     </div>
//   );
// }
