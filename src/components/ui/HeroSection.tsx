import React from 'react'
import type { Case } from '../../types/Case'
import { Play, Info } from 'lucide-react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

type Props = {
  featuredCase: Case
}

export default function HeroSection({ featuredCase }: Props) {
  return (
    <section className="relative w-full h-[70vh] bg-black">
      <Link to={`/case/${featuredCase.id}`}>
        <img
          src={featuredCase.image}
          alt={featuredCase.title}
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
      </Link>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

      <div className="relative z-10 h-full flex items-end">
        <div className="px-4 md:px-8 pb-8 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {featuredCase.title}
          </h2>
          <p className={clsx('mt-3 text-gray-300', 'line-clamp-3')}>
            {featuredCase.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              to={`/case/${featuredCase.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-red text-white font-semibold hover:bg-brand-red/90 transition"
            >
              <Play className="w-4 h-4" />
              Play Now
            </Link>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 text-white font-semibold hover:bg-gray-600 transition">
              <Info className="w-4 h-4" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
