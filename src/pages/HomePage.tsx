import React, { useEffect, useState } from 'react'
import HeroSection from '../components/ui/HeroSection'
import CaseRow from '../components/ui/CaseRow'
import type { Case, GroupedCases } from '../types/Case'
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
    type TelegramWebAppLite = { ready?: () => void; expand?: () => void }
    const tg =
      (window as unknown as { Telegram?: { WebApp?: TelegramWebAppLite } }).Telegram?.WebApp
    if (tg) {
      tg.ready?.()
      tg.expand?.()
    }
  }, [])

  const groupByCategory = (items: Case[]): GroupedCases => {
    return items.reduce((acc: GroupedCases, cur) => {
      const key = cur.category || 'General'
      if (!acc[key]) acc[key] = []
      acc[key].push(cur)
      return acc
    }, {})
  }
  const grouped = groupByCategory(cases)

  return (
    <div className="bg-brand-black text-white pb-24">
      {loading && (
        <div className="h-[50vh] flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      )}
      {!loading && cases[0] && <HeroSection featuredCase={cases[0]} />}
      <div className="mt-4">
        {!loading &&
          Object.keys(grouped).map((category) => (
            <CaseRow key={category} title={category} cases={grouped[category]} />
          ))}
      </div>
    </div>
  )
}
