'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const useKeys = () => {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false })
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }))
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }))
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  return keys
}

export default function Jeep() {
  const truckRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const keys = useKeys()
  const { camera } = useThree()

  const currentCameraPos = useRef(new THREE.Vector3(0, 5, -10))
  const currentCameraTarget = useRef(new THREE.Vector3(0, 0, 0))
  const zoomLevel = useRef(20)
  
  const isDragging = useRef(false)
  const cameraOrbit = useRef({ theta: 0, phi: Math.PI / 2 - 0.3 })

  // Physics state
  const velocity = useRef(0)
  const pitch = useRef(0)
  const roll = useRef(0)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      zoomLevel.current += e.deltaY * 0.02
      zoomLevel.current = THREE.MathUtils.clamp(zoomLevel.current, 5, 40)
    }
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) isDragging.current = true; // Middle mouse click
    }
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) isDragging.current = false;
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        cameraOrbit.current.theta -= e.movementX * 0.01;
        cameraOrbit.current.phi -= e.movementY * 0.01;
        cameraOrbit.current.phi = THREE.MathUtils.clamp(cameraOrbit.current.phi, 0.1, Math.PI / 2 - 0.05);
      }
    }

    window.addEventListener('wheel', handleWheel)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useFrame((state, delta) => {
    if (!truckRef.current) return

    const safeDelta = Math.min(delta, 0.05);

    const w = keys.w || keys.arrowup
    const s = keys.s || keys.arrowdown
    const a = keys.a || keys.arrowleft
    const d = keys.d || keys.arrowright

    const maxSpeed = 35;
    const acceleration = 50;
    const braking = 80;
    const friction = 15;
    const turnSpeed = 2.5;

    // Acceleration & Braking
    if (w) {
      velocity.current += acceleration * safeDelta;
    } else if (s) {
      velocity.current -= braking * safeDelta;
    } else {
      if (velocity.current > 0) velocity.current = Math.max(0, velocity.current - friction * safeDelta);
      if (velocity.current < 0) velocity.current = Math.min(0, velocity.current + friction * safeDelta);
    }
    
    velocity.current = THREE.MathUtils.clamp(velocity.current, -maxSpeed/3, maxSpeed);
    truckRef.current.translateZ(-velocity.current * safeDelta);
    
    const speedPct = velocity.current / maxSpeed;
    if (Math.abs(speedPct) > 0.05) {
        if (a) truckRef.current.rotation.y += turnSpeed * safeDelta * Math.sign(velocity.current);
        if (d) truckRef.current.rotation.y -= turnSpeed * safeDelta * Math.sign(velocity.current);
    }

    // --- Fake Physics ---
    let targetPitch = 0;
    if (w) targetPitch = 0.05; // Squat (nose up)
    if (s && velocity.current > 0) targetPitch = -0.15; // Dive (nose down)
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch, 8 * safeDelta);

    let targetRoll = 0;
    if (a) targetRoll = 0.1 * speedPct;
    if (d) targetRoll = -0.1 * speedPct;
    roll.current = THREE.MathUtils.lerp(roll.current, targetRoll, 8 * safeDelta);

    if (bodyRef.current) {
        // Apply local rotations (Hood faces +X locally, so Z is pitch, X is roll)
        bodyRef.current.rotation.set(roll.current, Math.PI / 2, pitch.current);
        
        if (Math.abs(velocity.current) > 10) {
           bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 50) * 0.02 * speedPct;
        } else {
           bodyRef.current.position.y = 0;
        }
    }

    // Boundary reset
    const pos = truckRef.current.position
    // Map shifted +100m. Starts at -100, ends at 350 (including roundabout).
    if (pos.x > 350 || pos.x < -100 || pos.z > 20 || pos.z < -50) {
      truckRef.current.position.set(-95, -0.07, -20);
      truckRef.current.rotation.set(0, -Math.PI / 2, 0); // Face +X
      velocity.current = 0;
    }
    
    // Camera Tracking
    const euler = truckRef.current.rotation
    const baseOffset = new THREE.Vector3().setFromSphericalCoords(zoomLevel.current, cameraOrbit.current.phi, cameraOrbit.current.theta)
    const cameraOffset = baseOffset.applyEuler(euler)
    const desiredCameraPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(cameraOffset)
    
    currentCameraPos.current.lerp(desiredCameraPos, THREE.MathUtils.clamp(8 * safeDelta, 0, 1))
    currentCameraTarget.current.lerp(pos, THREE.MathUtils.clamp(12 * safeDelta, 0, 1))
    
    camera.position.copy(currentCameraPos.current)
    camera.lookAt(currentCameraTarget.current)
  })

  return (
    <group ref={truckRef} position={[-95, -0.07, -20]} rotation={[0, -Math.PI / 2, 0]}>
      {/* 
        The bodyRef faces +X locally. We rotate it Math.PI/2 around Y so the hood faces -Z (forward in world space).
      */}
      <group ref={bodyRef} scale={[1.2, 1.2, 1.2]} rotation={[0, Math.PI / 2, 0]}>
        
        {/* Chassis */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <boxGeometry args={[3.8, 0.2, 1.6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        
        {/* Engine Block / Hood */}
        <mesh castShadow receiveShadow position={[0.9, 0.9, 0]}>
          <boxGeometry args={[1.6, 0.4, 1.4]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} metalness={0.7} />
        </mesh>
        
        {/* Cabin (Sloped using 4-sided cylinder) */}
        <mesh castShadow receiveShadow position={[-0.2, 1.25, 0]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[0.7, 1.0, 0.9, 4]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.2} metalness={0.9} /> {/* Glass-like */}
        </mesh>
        {/* Cabin Roof */}
        <mesh castShadow receiveShadow position={[-0.2, 1.75, 0]}>
          <boxGeometry args={[1.0, 0.1, 1.0]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Truck Bed Base */}
        <mesh castShadow receiveShadow position={[-1.3, 0.8, 0]}>
          <boxGeometry args={[1.2, 0.2, 1.4]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        
        {/* Bed Walls */}
        <mesh castShadow receiveShadow position={[-1.3, 1.0, 0.65]}>
          <boxGeometry args={[1.2, 0.4, 0.1]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh castShadow receiveShadow position={[-1.3, 1.0, -0.65]}>
          <boxGeometry args={[1.2, 0.4, 0.1]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh castShadow receiveShadow position={[-1.85, 1.0, 0]}>
          <boxGeometry args={[0.1, 0.4, 1.4]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Spare Tire in Bed */}
        <mesh castShadow receiveShadow position={[-1.3, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#050505" roughness={1.0} bumpScale={0.1} />
        </mesh>

        {/* Exhaust Pipes */}
        {[-0.5, 0.5].map((z, i) => (
          <mesh key={`exhaust-${i}`} castShadow receiveShadow position={[-0.8, 1.6, z]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.2]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Aggressive Front Grill */}
        <mesh castShadow receiveShadow position={[1.7, 0.8, 0]}>
          <boxGeometry args={[0.1, 0.6, 1.2]} />
          <meshStandardMaterial color="#050505" roughness={0.8} />
        </mesh>

        {/* Quad Headlights */}
        {[-0.4, 0.4].map((z, i) => (
           <group key={`headlight-${i}`}>
             <mesh position={[1.71, 0.9, z]}>
               <boxGeometry args={[0.05, 0.2, 0.3]} />
               <meshStandardMaterial color="#ffffee" emissive="#ffffee" emissiveIntensity={3} />
             </mesh>
           </group>
        ))}
        {/* Forward Point Light */}
        <pointLight position={[1.8, 0.9, 0]} intensity={80} distance={80} color="#ffffee" decay={1.5} />
        
        {/* Tail lights */}
        {[-0.5, 0.5].map((z, i) => (
          <mesh key={`tail-${i}`} position={[-1.91, 1.0, z]}>
             <boxGeometry args={[0.05, 0.15, 0.3]} />
             <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={2} />
          </mesh>
        ))}

        {/* Giant Chunky Wheels */}
        {[-0.9, 0.9].map((z, i) => (
          [-1.2, 1.2].map((x, j) => (
            <group key={`wheel-${i}-${j}`} position={[x, 0.4, z]}>
              {/* Suspension strut */}
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                <meshStandardMaterial color="#888" metalness={0.8} />
              </mesh>
              {/* Tire */}
              <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
                <meshStandardMaterial color="#050505" roughness={1.0} bumpScale={0.1} />
              </mesh>
              {/* Rim */}
              <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.52, 16]} />
                <meshStandardMaterial color="#aa8833" metalness={0.9} roughness={0.3} /> {/* Bronze rims */}
              </mesh>
            </group>
          ))
        ))}

      </group>
    </group>
  )
}
