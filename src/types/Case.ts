export interface Case {
  id: string | number
  title: string
  description: string
  image: string
  category: string
  rating: number
  year: number
  video_url?: string
  is_short?: boolean
  short_description?: string | null
}

export type GroupedCases = Record<string, Case[]>
