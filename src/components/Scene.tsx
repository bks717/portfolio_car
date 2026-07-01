'use client'

import { Canvas } from '@react-three/fiber'
import { Stars, Sky } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useEffect } from 'react'

import NightRoad from './NightRoad'
import ThrillRoad from './ThrillRoad'
import Jeep from './Jeep'

export default function Scene({ mode = 'normal' }: { mode?: 'normal' | 'thrill' }) {
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
      if (mode === 'normal') {
        crickets.play().catch(e => console.log("Crickets play failed or file missing: ", e));
      }
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);

    return () => {
      music.pause();
      crickets.pause();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    }
  }, [mode])

  return (
    <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
      {mode === 'normal' ? (
        <>
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
          <EffectComposer>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
          </EffectComposer>
        </>
      ) : (
        <>
          {/* Bright Sunny Day Sky */}
          <Sky distance={450000} sunPosition={[100, 50, -100]} inclination={0} azimuth={0.25} />
          
          <ambientLight intensity={0.5} color="#ffffff" />
          
          {/* The Sun */}
          <directionalLight
            castShadow
            position={[100, 100, -100]}
            intensity={2}
            color="#ffffee"
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.1}
            shadow-camera-far={500}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />

          <ThrillRoad />
        </>
      )}

      <Jeep />
    </Canvas>
  )
}
