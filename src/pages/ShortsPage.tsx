import React from 'react'
import { SHORTS } from '../data/mockData'
import ShortsPlayer from '../components/ui/ShortsPlayer'

export default function ShortsPage() {
  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black pb-20 scrollbar-hide">
      {SHORTS.map((s) => (
        <ShortsPlayer key={s.id} title={s.title} videoUrl={s.videoUrl} />
      ))}
    </div>
  )
}
