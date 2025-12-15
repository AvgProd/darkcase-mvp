import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Case } from '../types'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Play } from 'lucide-react'
import YouTube from 'react-youtube'

export default function CasePage() {
  const { id } = useParams()
  const [item, setItem] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return
      const { data, error } = await supabase.from('cases').select('*').eq('id', id).single()
      if (!error && data) {
        setItem(data as Case)
      } else {
        setItem(null)
      }
      setLoading(false)
    }
    fetchItem()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
        <p className="text-lg">Case not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black text-white pb-24">
      <Link
        to="/"
        className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black/60 border border-white/10 hover:bg-black/80 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="w-full">
        {!isPlaying ? (
          <div className="relative w-full aspect-video bg-black">
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-red text-white flex items-center justify-center hover:bg-brand-red/90 transition"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <Play className="w-7 h-7" />
            </button>
          </div>
        ) : (
          <div className="w-full">
            <YouTube
              videoId={item.videoId}
              opts={{
                width: '100%',
                height: '250',
                playerVars: {
                  autoplay: 1,
                  modestbranding: 1,
                  rel: 0,
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="px-4 md:px-8 mt-6">
        <h1 className="text-2xl md:text-3xl font-bold">{item.title}</h1>
        <div className="mt-2 text-sm text-gray-300">
          <span>{item.year}</span> • <span>{item.category}</span> •{' '}
          <span className="text-green-400">{item.rating}</span>
        </div>
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="mt-4 w-full md:w-auto inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-red text-white font-semibold hover:bg-brand-red/90 transition"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
        )}
        <p className="mt-4 text-gray-400">{item.description}</p>
      </div>
    </div>
  )
}
