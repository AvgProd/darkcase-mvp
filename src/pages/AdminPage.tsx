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
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
  const [imageFile, setImageFile] = useState<File | null>(null)

  const disabled = useMemo(
    () =>
      !newCase.title ||
      (!newCase.image && !imageFile) ||
      !newCase.videoId ||
      !newCase.rating ||
      !newCase.year ||
      !newCase.description ||
      !newCase.category,
    [newCase, imageFile]
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

  const getPublicUrlFromPath = (path: string) => {
    const { data } = supabase.storage.from('case-images').getPublicUrl(path)
    return data.publicUrl
  }

  const extractStoragePathFromUrl = (url: string) => {
    const marker = '/object/public/case-images/'
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.substring(idx + marker.length)
  }

  const uploadImage = async (file: File) => {
    const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
    const { error } = await supabase.storage.from('case-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    return getPublicUrlFromPath(path)
  }

  const deleteOldImageIfNeeded = async (url?: string) => {
    if (!url) return
    const path = extractStoragePathFromUrl(url)
    if (!path) return
    await supabase.storage.from('case-images').remove([path])
  }

  const addCase = async () => {
    if (disabled) return
    setErrorMsg(null)
    setSubmitLoading(true)
    let imageUrl = newCase.image
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile)
      } catch (err) {
        setSubmitLoading(false)
        setErrorMsg('Не удалось загрузить изображение. Попробуйте снова.')
        return
      }
    }
    const payload: Omit<Case, 'id'> = {
      title: newCase.title,
      description: newCase.description,
      image: imageUrl,
      category: newCase.category?.trim() || 'General',
      rating: parseFloat(newCase.rating),
      year: parseInt(newCase.year, 10),
      videoId: newCase.videoId,
    }
    const { error } = await supabase.from('cases').insert([payload])
    if (error) {
      setSubmitLoading(false)
      setErrorMsg('Ошибка при сохранении записи.')
      return
    }
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
    setImageFile(null)
    setSubmitLoading(false)
  }

  const handleEdit = (c: Case) => {
    setEditingId(c.id)
    setNewCase({
      title: c.title,
      category: c.category || '',
      image: c.image || '',
      videoId: c.videoId || '',
      rating: String(c.rating ?? ''),
      year: String(c.year ?? ''),
      description: c.description || '',
    })
    setImageFile(null)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    let imageUrl = newCase.image
    if (imageFile) {
      await deleteOldImageIfNeeded(newCase.image)
      imageUrl = await uploadImage(imageFile)
    }
    const payload: Partial<Case> = {
      title: newCase.title,
      description: newCase.description,
      image: imageUrl,
      category: newCase.category?.trim() || 'General',
      rating: parseFloat(newCase.rating),
      year: parseInt(newCase.year, 10),
      videoId: newCase.videoId,
    }
    await supabase.from('cases').update(payload).match({ id: Number(editingId) })
    await fetchCases()
    setEditingId(null)
    setNewCase({
      title: '',
      category: '',
      image: '',
      videoId: '',
      rating: '',
      year: '',
      description: '',
    })
    setImageFile(null)
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
            {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
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
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  setImageFile(f)
                }}
                className="w-full rounded-md bg-brand-dark text-white file:text-white file:bg-brand-dark file:border file:border-white/10 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
              {newCase.image && !imageFile && (
                <p className="mt-1 text-xs text-gray-400">Текущее изображение сохранено</p>
              )}
            </div>
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
            {editingId ? (
              <button
                disabled={disabled || submitLoading}
                onClick={handleUpdate}
                className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ОБНОВИТЬ ДЕЛО
              </button>
            ) : (
              <button
                disabled={disabled || submitLoading}
                onClick={addCase}
                className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.admin.add_case_cta}
              </button>
            )}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-2 bg-brand-dark text-white border border-white/10 hover:bg-brand-dark/80 transition"
                    title="Редактировать"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => deleteCase(c.id)}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-2 bg-brand-red text-white hover:bg-brand-red/90 transition"
                    title={t.common.delete}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
