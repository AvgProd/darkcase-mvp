import React from 'react'
import { useT } from '../hooks/useTranslation'

export default function MyContentPage() {
  const t = useT()
  return (
    <div className="min-h-screen w-full bg-brand-black text-white pb-24 flex items-center justify-center">
      <h1 className="text-xl font-bold">Мой контент</h1>
    </div>
  )
}
