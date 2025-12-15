import React, { useState } from 'react'
import { useT } from '../hooks/useTranslation'
import { Search as SearchIcon } from 'lucide-react'

export default function CatalogPage() {
  const t = useT()
  const [activeTab, setActiveTab] = useState<'movies' | 'series' | 'kids' | 'tv'>('movies')
  const [activeFilter, setActiveFilter] = useState<'newest' | 'genre' | 'rating' | 'year' | null>('newest')

  const tabBtn = (key: 'movies' | 'series' | 'kids' | 'tv', label: string) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={
        'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors border shadow-sm ' +
        (activeTab === key
          ? 'bg-brand-red text-white border-brand-red shadow-black/40'
          : 'bg-[#1a1a1a] text-gray-300 border-white/10 hover:bg-[#222] hover:text-white')
      }
    >
      {label}
    </button>
  )

  const chipBtn = (key: 'newest' | 'genre' | 'rating' | 'year', label: string) => (
    <button
      key={key}
      onClick={() => setActiveFilter(activeFilter === key ? null : key)}
      className={
        'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ' +
        (activeFilter === key
          ? 'bg-white text-black border-white ring-1 ring-white/60'
          : 'bg-[#121212] text-gray-200 border-white/10 hover:bg-[#1a1a1a]')
      }
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen w-full bg-brand-black text-white pb-24">
      <header className="sticky top-0 z-20 bg-brand-black/80 backdrop-blur px-4 py-3 border-b border-white/10">
        <div className="max-w-[560px] mx-auto">
          <h1 className="text-xl font-bold">{t.nav.catalog}</h1>
          <div className="mt-3 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.catalog?.search_placeholder ?? 'Фильмы и сериалы'}
              className="w-full h-10 rounded-xl bg-white/10 text-white placeholder:text-gray-400 border border-white/10 pl-9 focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              readOnly
            />
          </div>
        </div>
      </header>

      <section className="mt-4 px-4 md:px-8">
        <div className="max-w-[560px] mx-auto flex items-center gap-3 overflow-x-scroll whitespace-nowrap scrollbar-hide">
          {tabBtn('movies', 'Фильмы')}
          {tabBtn('series', 'Сериалы')}
          {tabBtn('kids', 'Детям')}
          {tabBtn('tv', 'ТВ')}
        </div>
      </section>

      <section className="mt-4 px-4 md:px-8">
        <div className="max-w-[560px] mx-auto flex items-center gap-2 overflow-x-scroll whitespace-nowrap scrollbar-hide">
          {chipBtn('newest', 'По новизне')}
          {chipBtn('genre', 'Жанр')}
          {chipBtn('rating', 'Рейтинг')}
          {chipBtn('year', 'Год')}
        </div>
      </section>

      <main className="px-4 md:px-8 mt-6">
        <div className="max-w-[560px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-[9/16] rounded-xl overflow-hidden bg-gradient-to-b from-[#1f1f1f] to-[#0e0e0e] border border-white/10"
            >
              <div className="h-full w-full flex items-end">
                <div className="w-full p-2">
                  <div className="h-2 w-3/5 bg-white/20 rounded-full mb-1" />
                  <div className="h-2 w-2/5 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
