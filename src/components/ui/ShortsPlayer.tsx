import React, { useState } from 'react'
import { Heart, Share2, ChevronUp, ChevronDown } from 'lucide-react'
import { useT } from '../../hooks/useTranslation'
import type { Case } from '../../types/Case'
import YouTube from 'react-youtube'

type Props = {
  items: Case[]
}

export default function ShortsPlayer({ items }: Props) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const current = items[index]

  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : i))
  const goNext = () => setIndex((i) => (i < items.length - 1 ? i + 1 : i))

  return (
    <div className="h-screen w-full relative bg-black pb-20">
      <div className="absolute inset-0">
        {current && (
          <YouTube
            videoId={current.videoId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
                controls: 0,
                playsinline: 1,
              },
            }}
            className="w-full h-full pointer-events-none"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="absolute bottom-6 left-4">
        <h4 className="text-lg font-semibold">{current?.title || ''}</h4>
        <p className="text-sm text-gray-300">{t.shorts.author}</p>
      </div>

      <div className="absolute bottom-6 right-4 flex flex-col items-center gap-4">
        <button className="p-3 rounded-full bg-black/60 border border-white/10">
          <Heart className="w-6 h-6 text-white" />
        </button>
        <button className="p-3 rounded-full bg-black/60 border border-white/10">
          <Share2 className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-3">
        <button
          onClick={goPrev}
          className="p-2 rounded-full bg-black/60 border border-white/10 hover:bg-black/80"
          disabled={index === 0}
          title={t.common.prev}
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={goNext}
          className="p-2 rounded-full bg-black/60 border border-white/10 hover:bg-black/80"
          disabled={index === items.length - 1}
          title={t.common.next}
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
}
