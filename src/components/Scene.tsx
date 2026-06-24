'use client'

import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useEffect } from 'react'

import NightRoad from './NightRoad'
import Jeep from './Jeep'

export default function Scene() {
  useEffect(() => {
    // We are expecting the user to place 'mondstadt.mp3' and 'crickets.mp3' in the public folder!
    const music = new Audio('/mondstadt.mp3');
    music.loop = true;
    music.volume = 0.5;

    const crickets = new Audio('/crickets.mp3');
    crickets.loop = true;
    crickets.volume = 1;

    let started = false;
    const startAudio = () => {
      if (started) return;
      started = true;

      music.play().catch(e => console.log("Music play failed or file missing: ", e));
      crickets.play().catch(e => console.log("Crickets play failed or file missing: ", e));
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);

    return () => {
      music.pause();
      crickets.pause();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    }
  }, [])

  return (
    <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
      {/* Deep Night Sky */}
      <color attach="background" args={['#05050a']} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      <ambientLight intensity={0.05} />

      {/* The Moon */}
      <mesh position={[-40, 50, -60]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>

      {/* Broad Moonlight to illuminate corners */}
      <pointLight
        position={[-40, 50, -60]}
        intensity={300}
        distance={200}
        color="#aaccff"
        decay={1.2}
      />
      <directionalLight
        position={[-40, 50, -60]}
        intensity={0.2}
        color="#aaccff"
      />

      <NightRoad />
      <Jeep />

      <EffectComposer>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
      </EffectComposer>
    </Canvas>
  )
}
