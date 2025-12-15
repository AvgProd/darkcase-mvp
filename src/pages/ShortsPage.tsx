import React, { useEffect, useState } from 'react'
import ShortsPlayer from '../components/ui/ShortsPlayer'
import type { Case } from '../types/Case'
import { supabase } from '../lib/supabase'
import { useT } from '../hooks/useTranslation'

export default function ShortsPage() {
  const [items, setItems] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const t = useT()

  useEffect(() => {
    let active = true
    const fetchCases = async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id,title,description,image,category,rating,year,video_url,is_short,short_description')
        .order('id', { ascending: true })
      const list = !error && data ? (data as Case[]) : []
      const filtered = list.filter((c) => c.is_short && c.video_url && String(c.video_url).trim().length > 0)
      if (active) setItems(filtered)
      if (active) setLoading(false)
    }
    fetchCases()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-full bg-black pb-20 flex items-center justify-center">
        <p className="text-gray-400">{t.common.loading}</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-black pb-20">
      {items.length > 0 ? (
        <ShortsPlayer items={items} />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-gray-400">{t.common.not_found}</p>
        </div>
      )}
    </div>
  )
}
