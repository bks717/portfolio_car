'use client'

import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

function Banner({ position, index }: { position: [number, number, number], index: number }) {
  // Create a sagging cloth geometry that spans the road
  const clothWidth = 14;
  const clothHeight = 2.4;
  const clothSag = 1.5; // How much it droops in the middle

  const clothGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(clothWidth, clothHeight, 32, 4);
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      // Parabola: y_add = a * x^2 - sag
      const a = clothSag / Math.pow(clothWidth / 2, 2);
      const yAdd = (a * Math.pow(x, 2)) - clothSag;
      positions.setY(i, positions.getY(i) + yAdd);
    }
    geo.computeVertexNormals();
    return geo;
  }, [])

  return (
    <group position={position}>
      {/* Left Pole */}
      <mesh position={[0, 6, -clothWidth / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 12]} />
        <meshStandardMaterial color="#333" roughness={0.6} metalness={0.5} />
      </mesh>
      
      {/* Right Pole */}
      <mesh position={[0, 6, clothWidth / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 12]} />
        <meshStandardMaterial color="#333" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Sagging Cloth/Banner spanning across the road between poles */}
      <mesh geometry={clothGeometry} position={[0, 9.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color={index % 2 === 0 ? "#661111" : "#111166"} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Dim Yellow Ring Lights at the bottom of the poles */}
      <mesh position={[0, 0.2, -clothWidth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.05, 16, 32]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 0.2, clothWidth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.05, 16, 32]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1} />
      </mesh>
      
      {/* Low intensity yellow ambient glow for the gate base */}
      <pointLight position={[0, 0.5, 0]} intensity={15} distance={15} color="#ffcc00" decay={1.5} />
    </group>
  )
}

function Gate() {
  const leftDoor = useRef<THREE.Group>(null)
  const rightDoor = useRef<THREE.Group>(null)
  
  useFrame(({ camera }) => {
    // Gate is at x = -85. The camera trails the car. 
    const distToGate = -85 - camera.position.x;
    
    // Open if camera is within 35 meters (car is ~15 meters away)
    const targetAngle = distToGate < 35 && distToGate > -100 ? Math.PI / 2.2 : 0;
    
    if (leftDoor.current && rightDoor.current) {
      leftDoor.current.rotation.y = THREE.MathUtils.lerp(leftDoor.current.rotation.y, targetAngle, 0.05);
      rightDoor.current.rotation.y = THREE.MathUtils.lerp(rightDoor.current.rotation.y, -targetAngle, 0.05);
    }
  })

  return (
    <group position={[-85, -0.45, -20]}>
      {/* Left Pillar */}
      <mesh position={[0, 2, -7.5]} castShadow>
        <boxGeometry args={[1, 4, 1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[0, 2, 7.5]} castShadow>
        <boxGeometry args={[1, 4, 1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Left Door */}
      <group position={[0, 2, -7]} ref={leftDoor}>
        <mesh position={[0, 0, 3.5]} castShadow>
          <boxGeometry args={[0.2, 3, 7]} />
          <meshStandardMaterial color="#882222" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Right Door */}
      <group position={[0, 2, 7]} ref={rightDoor}>
        <mesh position={[0, 0, -3.5]} castShadow>
          <boxGeometry args={[0.2, 3, 7]} />
          <meshStandardMaterial color="#882222" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

function Worker({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const [show, setShow] = useState(false)

  return (
    <group position={position} rotation={rotation} 
      onClick={(e) => { e.stopPropagation(); setShow(!show); }}
      onPointerEnter={() => document.body.style.cursor = 'pointer'}
      onPointerLeave={() => document.body.style.cursor = 'auto'}
    >
      {/* Legs (Blue Jeans) */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.2, 2, 0.8]} />
        <meshStandardMaterial color="#224488" />
      </mesh>
      {/* Torso (High Vis Orange) */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[1.5, 3, 1]} />
        <meshStandardMaterial color="#ff5500" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffccaa" />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 6.1, 0.2]}>
        <boxGeometry args={[1.1, 0.2, 1.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Interactive HTML Button Overlay */}
      {show && (
        <Html position={[0, 7.5, 0]} center zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            border: '2px solid #00ffcc',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '200px',
            boxShadow: '0 0 15px rgba(0, 255, 204, 0.5)'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 10px 0', fontFamily: 'sans-serif' }}>Mechanic</h3>
            <button style={{
              background: '#00ffcc',
              border: 'none',
              color: 'black',
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              cursor: 'pointer',
              borderRadius: '4px',
              textTransform: 'uppercase',
              pointerEvents: 'auto',
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => {
              window.alert("Showing Resume! (You can link a PDF or another page here)");
            }}
            >
              Show Resume
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

function GasStation() {
  return (
    <group position={[300, -0.45, -20]}>
      {/* Asphalt Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 25, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      
      {/* Station Concrete Island */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[20, 0.4, 8]} />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>

      {/* Canopy Pillars */}
      <mesh position={[-8, 4, -2]}>
        <boxGeometry args={[0.8, 8, 0.8]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      <mesh position={[8, 4, -2]}>
        <boxGeometry args={[0.8, 8, 0.8]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      <mesh position={[-8, 4, 2]}>
        <boxGeometry args={[0.8, 8, 0.8]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      <mesh position={[8, 4, 2]}>
        <boxGeometry args={[0.8, 8, 0.8]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>

      {/* Massive Canopy Roof */}
      <mesh position={[0, 8.5, 0]}>
        <boxGeometry args={[24, 1, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Neon Edge of Canopy */}
      <mesh position={[0, 8.5, 6.1]}>
        <boxGeometry args={[24.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 8.5, -6.1]}>
        <boxGeometry args={[24.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
      </mesh>

      {/* Fluorescent Lights under Canopy */}
      <pointLight position={[0, 7.5, 0]} intensity={300} distance={40} color="#ffffff" decay={1.5} />
      <mesh position={[0, 7.9, 0]}>
        <boxGeometry args={[18, 0.2, 4]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} />
      </mesh>

      {/* Gas Pumps */}
      {[-4, 0, 4].map((x, i) => (
        <group key={`pump-${i}`} position={[x, 1.5, 0]}>
          {/* Main Body */}
          <mesh>
            <boxGeometry args={[1.5, 3, 1]} />
            <meshStandardMaterial color="#cc2222" metalness={0.3} roughness={0.5} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 0.8, 0.51]}>
            <planeGeometry args={[0.8, 0.6]} />
            <meshStandardMaterial color="#111" emissive="#00ff00" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      {/* 2 Workers */}
      <Worker position={[-6, 0.4, 2]} rotation={[0, Math.PI / 4, 0]} />
      <Worker position={[5, 0.4, -2]} rotation={[0, -Math.PI / 4, 0]} />
    </group>
  )
}

export default function NightRoad() {
  const mapLength = 400;
  
  return (
    <group>
      {/* The Dark Asphalt Road, Shifted +100m forward to optimize space */}
      <group position={[100, -0.45, -20]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[mapLength, 15]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        
        {/* Center Line (Dashed) */}
        {Array.from({ length: Math.floor(mapLength / 4) }).map((_, i) => (
          <mesh key={i} position={[(i - mapLength / 8) * 4, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 0.4]} />
            <meshStandardMaterial color="#555555" roughness={1} />
          </mesh>
        ))}
      </group>

      {/* Rocky Soil Left (under Banners) */}
      <mesh position={[100, -0.48, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[mapLength, 10]} />
        <meshStandardMaterial color="#2d2015" roughness={1} bumpScale={0.2} />
      </mesh>

      {/* Rocky Soil Right (under Lanterns) */}
      <mesh position={[100, -0.48, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[mapLength, 10]} />
        <meshStandardMaterial color="#2d2015" roughness={1} bumpScale={0.2} />
      </mesh>

      {/* The Dynamic Gate at the start of the road */}
      <Gate />

      {/* 5 Big Overhead Banners spanning across the road */}
      <group position={[0, 0, -20]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const xPos = -40 + i * 60;
          return <Banner key={`banner-${i}`} position={[xPos, 0, 0]} index={i} />
        })}
      </group>

      {/* 5 Glowing Lanterns pushed further left, away from the banners */}
      <group position={[0, 0, -32]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const xPos = -40 + i * 60; 
          return (
            <group key={`lantern-${i}`} position={[xPos, 0, 0]}>
              {/* Tall Pole */}
              <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 8]} />
                <meshStandardMaterial color="#222" roughness={0.8} />
              </mesh>
              {/* Huge Lantern Bulb (Emissive) */}
              <mesh position={[0, 8.6, 0]}>
                <boxGeometry args={[0.8, 1.2, 0.8]} />
                <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={4} />
              </mesh>
              {/* Lantern Cap */}
              <mesh position={[0, 9.4, 0]}>
                <coneGeometry args={[0.8, 0.6, 4]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              
              {/* Orange Point Light */}
              <pointLight position={[0, 8.6, 0]} intensity={150} distance={40} color="#ff9900" decay={1.5} />
            </group>
          )
        })}
      </group>

      {/* The Gas Station at the end of the road */}
      <GasStation />
    </group>
  )
}
