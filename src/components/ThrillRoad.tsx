'use client'

import * as THREE from 'three'

export default function ThrillRoad() {
  const mapLength = 400;
  const mapWidth = 200;

  return (
    <group>
      {/* Base Grass Terrain */}
      <mesh position={[25, -0.45, -20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[mapLength, mapWidth]} />
        <meshStandardMaterial color="#3b5e2b" roughness={0.9} />
      </mesh>

      {/* Dirt Path (Main track) */}
      <mesh position={[25, -0.4, -20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[mapLength, 15]} />
        <meshStandardMaterial color="#654321" roughness={1} bumpScale={0.1} />
      </mesh>

      {/* Scattered Rocks and Boulders */}
      {Array.from({ length: 100 }).map((_, i) => {
        const x = -80 + Math.random() * 350;
        const zOff = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 80);
        const z = -20 + zOff;
        const scale = 1 + Math.random() * 4;
        
        return (
          <mesh key={`rock-${i}`} position={[x, -0.45 + scale / 2.5, z]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]} castShadow receiveShadow>
            <dodecahedronGeometry args={[scale, 1]} />
            <meshStandardMaterial color="#7a7a7a" roughness={0.8} />
          </mesh>
        )
      })}

      {/* Jumps / Ramps on the track */}
      {[-20, 50, 120, 200, 280].map((x, i) => (
        <group key={`ramp-${i}`} position={[x, -0.45, -20]}>
          <mesh position={[0, 1, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow receiveShadow>
            <boxGeometry args={[10, 0.5, 12]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
          </mesh>
          <mesh position={[3, 0.5, 0]} castShadow receiveShadow>
             <boxGeometry args={[4, 2, 12]} />
             <meshStandardMaterial color="#4a3018" roughness={1} />
          </mesh>
          <mesh position={[6, 1, 0]} rotation={[0, 0, Math.PI / 6]} castShadow receiveShadow>
            <boxGeometry args={[6, 0.5, 12]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Mud Patches */}
      {[10, 80, 160, 240, 310].map((x, i) => (
        <mesh key={`mud-${i}`} position={[x, -0.38, -20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
           <circleGeometry args={[6 + Math.random() * 4, 32]} />
           <meshStandardMaterial color="#2c1a0e" roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
      
      {/* Trees / Shrubs */}
      {Array.from({ length: 150 }).map((_, i) => {
        const x = -100 + Math.random() * 400;
        const zOff = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 80);
        const z = -20 + zOff;
        const scale = 0.5 + Math.random() * 1.5;
        return (
          <group key={`tree-${i}`} position={[x, -0.45, z]} scale={[scale, scale, scale]}>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.6, 3]} />
              <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </mesh>
            <mesh position={[0, 4, 0]} castShadow receiveShadow>
               <coneGeometry args={[3.5, 6, 8]} />
               <meshStandardMaterial color="#2e7d32" roughness={0.8} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
