import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavigationTabs from '../components/moe/NavigationTabs'
import MediaItemRow from '../components/moe/MediaItemRow'
import { getProgressList } from '../lib/progress'

type TabKey = 'continue' | 'downloads' | 'watchLater'

function formatRemaining(positionSec: number, durationSec: number) {
  const remaining = Math.max(0, durationSec - positionSec)
  const minutes = Math.ceil(remaining / 60)
  return `Осталось ${minutes} минут`
}

export default function MoePage() {
  const navigate = useNavigate()
  const [active, setActive] = useState<TabKey>('continue')
  const progressItems = getProgressList().map((p) => ({
    title: p.title,
    remainingTime: formatRemaining(p.positionSec, p.durationSec),
    progress: p.durationSec > 0 ? Math.round((p.positionSec / p.durationSec) * 100) : 0,
  }))

  return (
    <div className="min-h-screen w-full bg-brand-black text-white">
      <div className="sticky top-0 z-40 bg-brand-black/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="text-gray-300"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <span className="text-2xl">{'<'}</span>
          </button>
          <div className="text-lg font-semibold">Моё</div>
          <div className="w-6" />
        </div>
        <NavigationTabs active={active} onChange={setActive} />
      </div>

      <div className="mt-2">
        {(active === 'continue' ? progressItems : []).map((item, idx) => (
          <MediaItemRow
            key={`${item.title}-${idx}`}
            title={item.title}
            remainingTime={item.remainingTime}
            progress={item.progress}
          />
        ))}
      </div>
    </div>
  )
}
