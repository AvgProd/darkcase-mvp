export interface Case {
  id: string;
  title: string;
  description: string;
  image: string; // URL for poster
  category: string;
  rating: string; // e.g., "9.8"
  year: number;
  videoId: string;
}
