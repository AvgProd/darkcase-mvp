import React from 'react'

export default function MediaItemRow({
  title,
  remainingTime,
  progress,
}: {
  title: string
  remainingTime: string
  progress: number
}) {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-gray-400">{remainingTime}</div>
        <div className="mt-2 h-2 w-full rounded bg-gray-700/70">
          <div
            className="h-2 rounded bg-green-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
