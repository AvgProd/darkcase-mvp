import React from 'react'
import type { Case } from '../../types/Case'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  cases: Case[]
}

export default function CaseRow({ title, cases }: Props) {
  return (
    <section className="mt-6">
      <h3 className="px-4 md:px-8 text-lg font-semibold">{title}</h3>
      <div className="mt-3 overflow-x-auto scrollbar-hide">
        <div className="px-4 md:px-8 flex gap-4">
          {cases.map((c) => (
            <Link
              key={c.id}
              to={`/case/${c.id}`}
              className="group relative flex-shrink-0 w-32 md:w-40 rounded-lg overflow-hidden bg-brand-dark"
            >
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-48 md:h-56 object-cover"
              />
              <div className="absolute top-1 left-1 rounded px-2 py-0.5 bg-black/60 text-white/80 text-[11px]">
                {c.year}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs text-white font-medium truncate">
                  {c.title}
                </p>
                <p className="text-[11px] text-gray-400">
                  {c.year} • {c.rating}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
