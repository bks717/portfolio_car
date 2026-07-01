'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const Scene = dynamic(() => import('@/components/Scene'), { ssr: false })

export default function Home() {
  const [mode, setMode] = useState<'normal' | 'thrill'>('normal')

  return (
    <main className="w-full h-screen relative bg-black">
      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 text-white font-bold text-2xl drop-shadow-md pointer-events-none">
        WASD to Drive
      </div>
      
      {/* Switch Button */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setMode(mode === 'normal' ? 'thrill' : 'normal')}
          className={`px-8 py-3 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-300 shadow-lg border-2 ${
            mode === 'normal' 
              ? 'bg-white text-black border-white hover:bg-gray-200' 
              : 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)] hover:bg-red-700'
          }`}
        >
          {mode}
        </button>
      </div>

      <Scene mode={mode} />
    </main>
  )
}
