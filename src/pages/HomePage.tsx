import React from 'react'
import { CASES } from '../data/mockData'
import HeroSection from '../components/ui/HeroSection'
import CaseRow from '../components/ui/CaseRow'

export default function HomePage() {
  const trending = CASES.filter((c) => c.category === 'Trending')
  const killers = CASES.filter((c) => c.category === 'Serial Killers')
  const unsolved = CASES.filter((c) => c.category === 'Unsolved')

  return (
    <div className="bg-brand-black text-white pb-24">
      <HeroSection featuredCase={CASES[0]} />
      <div className="mt-4">
        <CaseRow title="Trending Now" cases={trending} />
        <CaseRow title="Serial Killers" cases={killers} />
        <CaseRow title="Unsolved Mysteries" cases={unsolved} />
      </div>
    </div>
  )
}
