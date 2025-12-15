import React, { useState } from 'react'
import { useT } from '../hooks/useTranslation'

export default function CatalogPage() {
  const t = useT()
  const [activeTab, setActiveTab] = useState<'movies' | 'series' | 'kids' | 'tv'>('movies')
  const [activeFilter, setActiveFilter] = useState<'newest' | 'genre' | 'rating' | 'year' | null>('newest')

  const tabBtn = (key: 'movies' | 'series' | 'kids' | 'tv', label: string) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={
        'px-4 py-2 rounded-full text-sm border ' +
        (activeTab === key
          ? 'bg-brand-red text-white border-brand-red'
          : 'bg-brand-dark text-gray-300 border-white/10 hover:bg-brand-dark/80')
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
        'px-3 py-1 rounded-full text-xs border ' +
        (activeFilter === key
          ? 'bg-white text-black border-white'
          : 'bg-brand-dark text-gray-200 border-white/10 hover:bg-brand-dark/80')
      }
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen w-full bg-brand-black text-white pb-24">
      <header className="sticky top-0 z-20 bg-brand-black/80 backdrop-blur px-4 py-3 border-b border-white/10">
        <h1 className="text-xl font-bold">Каталог</h1>
      </header>

      <section className="px-4 md:px-8 mt-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {tabBtn('movies', 'Фильмы')}
          {tabBtn('series', 'Сериалы')}
          {tabBtn('kids', 'Детям')}
          {tabBtn('tv', 'ТВ')}
        </div>
      </section>

      <section className="px-4 md:px-8 mt-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {chipBtn('newest', 'По новизне')}
          {chipBtn('genre', 'Жанр')}
          {chipBtn('rating', 'Рейтинг')}
          {chipBtn('year', 'Год')}
        </div>
      </section>

      <main className="px-4 md:px-8 mt-6">
        <div className="rounded-xl bg-brand-dark/60 border border-white/10 p-6">
          <p className="text-sm text-gray-400">
            Визуальные табы и фильтры подготовлены. Логика выбора категорий и фильтрации будет добавлена на следующем шаге.
          </p>
        </div>
      </main>
    </div>
  )
}
