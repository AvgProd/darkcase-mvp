import React, { useEffect, useState } from 'react'
import type { Case } from '../types/Case'
import { supabase } from '../lib/supabase'
import { useT } from '../hooks/useTranslation'

export default function SearchPage() {
  const t = useT()
  const [items, setItems] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchCases = async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id,title,description,image,category,rating,year,video_url,is_short,short_description')
        .order('id', { ascending: true })
      const list = !error && data ? (data as Case[]) : []
      if (active) setItems(list)
      if (active) setLoading(false)
    }
    fetchCases()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black pb-20 flex items-center justify-center">
        <p className="text-gray-400">{t.common.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-black pb-24 px-4 md:px-8">
      <div className="max-w-[960px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((c) => (
          <div
            key={c.id}
            className="aspect-[9/16] rounded-xl overflow-hidden bg-gradient-to-b from-[#1f1f1f] to-[#0e0e0e] border border-white/10"
          >
            {c.image ? (
              <img src={c.image || ''} alt={c.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
