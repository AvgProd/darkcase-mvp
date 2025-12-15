import React, { useState } from 'react'
import { Search as SearchIcon, Frown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Case } from '../types/Case'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Case[]>([])
 
  const handleSearch = async (q: string) => {
    const value = q.trim()
    if (!value) {
      setResults([])
      return
    }
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .ilike('title', `%${value}%`)
    if (!error && data) {
      setResults(data as Case[])
    } else {
      setResults([])
    }
  }
 
  const showEmpty = query.trim().length > 0 && results.length === 0
  const showTop = query.trim().length === 0

  return (
    <div className="min-h-screen w-full bg-brand-black text-white pb-24">
      <div className="sticky top-0 z-20 bg-brand-black px-4 py-3 border-b border-white/10">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => {
              const v = e.target.value
              setQuery(v)
              handleSearch(v)
            }}
            placeholder="Search cases, detectives..."
            className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 pl-10 pr-3 py-2 outline-none border border-white/10 focus:border-white/20"
          />
        </div>
      </div>

      {showTop && (
        <div className="px-4 py-4">
          <h3 className="text-sm text-gray-400">Top Genres</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Trending', 'Serial Killers', 'Unsolved', 'New Releases', 'Forensic'].map((g) => (
              <span
                key={g}
                className="inline-flex items-center px-3 py-1 rounded-full bg-brand-dark text-gray-200 text-xs border border-white/10"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {!showTop && !showEmpty && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((c) => (
              <Link key={c.id} to={`/case/${c.id}`} className="group">
                <div className="relative w-full rounded-md overflow-hidden bg-brand-dark border border-white/10">
                  <div className="pb-[150%]" />
                  <img
                    src={c.image}
                    alt={c.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="mt-2 text-sm text-gray-200 truncate">{c.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showEmpty && (
        <div className="w-full flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-gray-400">
            <Frown className="w-6 h-6" />
            <span>Ничего не найдено.</span>
          </div>
        </div>
      )}
    </div>
  )
}
