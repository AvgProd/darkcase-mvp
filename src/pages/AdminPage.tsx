import React, { useEffect, useMemo, useState } from 'react'
import type { Case } from '../types/Case'
import { Trash } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useT } from '../hooks/useTranslation'

export default function AdminPage() {
  const t = useT()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)

  type NewCaseForm = {
    title: string
    category: string
    image: string
    videoId: string
    rating: string
    year: string
    description: string
  }
  const [newCase, setNewCase] = useState<NewCaseForm>({
    title: '',
    category: '',
    image: '',
    videoId: '',
    rating: '',
    year: '',
    description: '',
  })

  const disabled = useMemo(
    () =>
      !newCase.title ||
      !newCase.image ||
      !newCase.videoId ||
      !newCase.rating ||
      !newCase.year ||
      !newCase.description ||
      !newCase.category,
    [newCase]
  )

  const handleLogin = () => {
    if (password === 'admin123') {
      setAuthenticated(true)
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setPassword('')
  }

  const fetchCases = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cases').select('*')
    if (!error && data) {
      setCases(data as Case[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const addCase = async () => {
    if (disabled) return
    const payload: Omit<Case, 'id'> = {
      title: newCase.title,
      description: newCase.description,
      image: newCase.image,
      category: newCase.category?.trim() || 'General',
      rating: parseFloat(newCase.rating),
      year: parseInt(newCase.year, 10),
      videoId: newCase.videoId,
    }
    await supabase.from('cases').insert([payload])
    await fetchCases()
    setNewCase({
      title: '',
      category: '',
      image: '',
      videoId: '',
      rating: '',
      year: '',
      description: '',
    })
  }

  const deleteCase = async (id: string | number) => {
    await supabase.from('cases').delete().eq('id', Number(id))
    await fetchCases()
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-sm rounded-xl bg-brand-dark/80 border border-white/10 p-6">
          <h1 className="text-xl font-bold text-center">{t.admin.admin_login}</h1>
          <p className="mt-1 text-center text-gray-400">{t.admin.restricted_area}</p>
          <div className="mt-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.admin.enter_password}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          </div>
          <button
            onClick={handleLogin}
            className="mt-4 w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition"
          >
            {t.admin.unlock_dashboard}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10">
        <h2 className="text-2xl font-bold text-brand-red">{t.admin.hq_title}</h2>
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-2 bg-brand-dark border border-white/10 hover:bg-brand-dark/80 transition"
        >
          {t.common.logout}
        </button>
      </header>

      <main className="px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
          <h3 className="text-lg font-semibold">{t.admin.add_case}</h3>
          <div className="mt-4 space-y-3">
            <input
              value={newCase.title}
              onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
              placeholder={t.admin.field_title}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              type="text"
              value={newCase.category}
              onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
              placeholder={t.admin.field_category_placeholder}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              value={newCase.image}
              onChange={(e) => setNewCase({ ...newCase, image: e.target.value })}
              placeholder={t.admin.field_image_url}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              value={newCase.videoId}
              onChange={(e) => setNewCase({ ...newCase, videoId: e.target.value })}
              placeholder={t.admin.field_video_id}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              value={newCase.rating}
              onChange={(e) => setNewCase({ ...newCase, rating: e.target.value })}
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder={t.admin.field_rating_placeholder}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              value={newCase.year}
              onChange={(e) => setNewCase({ ...newCase, year: e.target.value })}
              type="number"
              inputMode="numeric"
              placeholder={t.admin.field_year_placeholder}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <textarea
              value={newCase.description}
              onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
              placeholder={t.admin.field_description}
              rows={4}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <button
              disabled={disabled}
              onClick={addCase}
              className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.admin.add_case_cta}
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
          <h3 className="text-lg font-semibold">{t.admin.manage_cases}</h3>
          <div className="mt-4 space-y-3">
            {loading && <p className="text-sm text-gray-400">{t.common.loading}</p>}
            {!loading && cases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-md bg-brand-dark px-3 py-2 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.category} • {c.rating}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteCase(c.id)}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-2 bg-brand-red text-white hover:bg-brand-red/90 transition"
                  title={t.common.delete}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
