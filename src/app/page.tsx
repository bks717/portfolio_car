'use client'

import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/Scene'), { ssr: false })

export default function Home() {
  return (
    <main className="w-full h-screen relative">
      <div className="absolute top-4 left-4 z-10 text-white font-bold text-2xl drop-shadow-md">
        WASD to Drive
      </div>
      <Scene />
    </main>
  )
}
