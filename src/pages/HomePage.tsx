import React, { useEffect, useState } from 'react'
import HeroSection from '../components/ui/HeroSection'
import CaseRow from '../components/ui/CaseRow'
import type { Case } from '../types'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCases = async () => {
      const { data, error } = await supabase.from('cases').select('*')
      if (!error && data) {
        setCases(data as Case[])
      }
      setLoading(false)
    }
    fetchCases()
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready?.()
      tg.expand?.()
    }
  }, [])

  const trending = cases.filter((c) => c.category === 'Trending')
  const killers = cases.filter((c) => c.category === 'Serial Killers')
  const unsolved = cases.filter((c) => c.category === 'Unsolved')

  return (
    <div className="bg-brand-black text-white pb-24">
      {loading && (
        <div className="h-[50vh] flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      )}
      {!loading && cases[0] && <HeroSection featuredCase={cases[0]} />}
      <div className="mt-4">
        {!loading && (
          <>
            <CaseRow title="Trending Now" cases={trending} />
            <CaseRow title="Serial Killers" cases={killers} />
            <CaseRow title="Unsolved Mysteries" cases={unsolved} />
          </>
        )}
      </div>
    </div>
  )
}
