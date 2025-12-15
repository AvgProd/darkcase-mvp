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
    <div className="flex gap-6 px-4 pt-2">
      {tabs.map((t) => {
        const isActive = t.key === active
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`text-base ${isActive ? 'text-white' : 'text-gray-400'}`}
          >
            <div className="inline-flex flex-col">
              <span className="inline-block">{t.label}</span>
              <span className={`mt-2 h-1 rounded-full w-full ${isActive ? 'bg-green-500' : 'bg-transparent'}`} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
