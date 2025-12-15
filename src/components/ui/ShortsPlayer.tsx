import { Heart, Share2 } from 'lucide-react'

type Props = {
  title: string
  videoUrl: string
}

export default function ShortsPlayer({ title, videoUrl }: Props) {
  return (
    <div className="h-screen w-full relative snap-start bg-black">
      <div className="absolute inset-0">
        <iframe
          className="w-full h-full pointer-events-none scale-[1.25]"
          src={`https://www.youtube.com/embed/${videoUrl}?controls=0&autoplay=1&mute=1&playsinline=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="absolute bottom-6 left-4">
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-sm text-gray-300">@DarkCase</p>
      </div>

      <div className="absolute bottom-6 right-4 flex flex-col items-center gap-4">
        <button className="p-3 rounded-full bg-black/60 border border-white/10">
          <Heart className="w-6 h-6 text-white" />
        </button>
        <button className="p-3 rounded-full bg-black/60 border border-white/10">
          <Share2 className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}
