export interface Case {
  id: number
  title: string
  description: string
  image: string
  category: string
  rating: number
  year: number
  videoId: string
}

export type GroupedCases = Record<string, Case[]>
