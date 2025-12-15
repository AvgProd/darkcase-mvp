import React, { useEffect, useState } from 'react'
import ShortsPlayer from '../components/ui/ShortsPlayer'
import type { Case } from '../types/Case'
import { supabase } from '../lib/supabase'

export default function ShortsPage() {
  const [items, setItems] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCases = async () => {
      const { data, error } = await supabase.from('cases').select('*').order('id', { ascending: true })
      if (!error && data) {
        setItems(data as Case[])
      } else {
        setItems([])
      }
      setLoading(false)
    }
    fetchCases()
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-full bg-black pb-20 flex items-center justify-center">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    )
  }

  return <div className="h-screen w-full bg-black pb-20">{items.length > 0 && <ShortsPlayer items={items} />}</div>
}
