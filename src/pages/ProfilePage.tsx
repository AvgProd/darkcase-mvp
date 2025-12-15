 
import { ChevronRight } from 'lucide-react'
import { CASES } from '../data/mockData'
import CaseRow from '../components/ui/CaseRow'
import { useT } from '../hooks/useTranslation'

export default function ProfilePage() {
  const t = useT()
  const myList = CASES.slice(0, 3)

  return (
    <div className="min-h-screen w-full bg-brand-black text-white pb-24">
      <div className="relative">
        <div className="absolute inset-0 h-40 bg-gradient-to-b from-brand-dark/60 to-transparent" />
        <div className="relative flex flex-col items-center justify-center pt-10 pb-6">
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop"
              alt={t.profile.user_alt}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-3 text-2xl font-bold">{t.profile.user_name}</h2>
          <p className="mt-1 text-sm text-gray-400">{t.profile.member_since}</p>
        </div>
      </div>

      <div className="mt-2">
        <CaseRow title={t.profile.my_list} cases={myList} />
      </div>

      <div className="mt-6 px-4 md:px-8 space-y-3">
        {t.profile.settings.map((item) => (
          <button
            key={item}
            className="w-full flex items-center justify-between rounded-md bg-brand-dark px-4 py-3 border border-white/10 hover:bg-brand-dark/80 transition"
          >
            <span className="text-sm">{item}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="text-gray-500">{t.profile.sign_out}</button>
      </div>
    </div>
  )
}
