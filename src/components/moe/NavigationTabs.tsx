import React from 'react'

type TabKey = 'continue' | 'downloads' | 'watchLater'

export default function NavigationTabs({
  active,
  onChange,
}: {
  active: TabKey
  onChange: (key: TabKey) => void
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'continue', label: 'Продолжить' },
    { key: 'downloads', label: 'Загрузки' },
    { key: 'watchLater', label: 'Буду смотреть' },
  ]

  return (
    <div className="flex gap-4 px-4 pt-2">
      {tabs.map((t) => {
        const isActive = t.key === active
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={
              'inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ' +
              (isActive ? 'text-brand-red' : 'text-gray-400 hover:text-white')
            }
          >
            <span
              className={
                'inline-block w-fit leading-none ' +
                (isActive ? 'border-b-2 border-brand-red pb-0.5' : '')
              }
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
