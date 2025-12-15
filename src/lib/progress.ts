type ProgressEntry = {
  id: string
  title: string
  positionSec: number
  durationSec: number
  updatedAt: number
}

const KEY = 'watchProgress'

export function getProgressMap(): Record<string, ProgressEntry> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveProgress(entry: ProgressEntry) {
  const map = getProgressMap()
  map[entry.id] = { ...entry, updatedAt: Date.now() }
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function getProgress(id: string): ProgressEntry | null {
  const map = getProgressMap()
  return map[id] ?? null
}

export function getProgressList(): ProgressEntry[] {
  const map = getProgressMap()
  return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function clearProgress(id: string) {
  const map = getProgressMap()
  delete map[id]
  localStorage.setItem(KEY, JSON.stringify(map))
}
