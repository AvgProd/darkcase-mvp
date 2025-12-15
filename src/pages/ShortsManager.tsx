import React, { useEffect, useMemo, useState } from 'react'
import type { Case } from '../types/Case'
import { Trash } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useT } from '../hooks/useTranslation'

type ShortForm = {
  title: string
  videoUrl: string
  shortDescription: string
}
type EditForm = {
  title: string
  videoUrl: string
  shortDescription: string
}

export default function ShortsManager() {
  const t = useT()
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [items, setItems] = useState<Case[]>([])
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [form, setForm] = useState<ShortForm>({
    title: '',
    videoUrl: '',
    shortDescription: '',
  })
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    videoUrl: '',
    shortDescription: '',
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const disabled = useMemo(
    () => !form.title || (!videoFile && !form.videoUrl),
    [form.title, videoFile, form.videoUrl]
  )

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cases').select('*')
    const list = !error && data ? (data as Case[]) : []
    setItems(list.filter((c) => !!c.is_short))
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const getVideoPublicUrlFromPath = (path: string) => {
    const { data } = supabase.storage.from('short-videos').getPublicUrl(path)
    return data.publicUrl
  }

  const extractVideoStoragePathFromUrl = (url: string) => {
    const marker = '/object/public/short-videos/'
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.substring(idx + marker.length)
  }

  const uploadVideo = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const safeName = `short-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const renamed = new File([file], safeName, { type: file.type || 'video/mp4' })
    const path = `uploads/${renamed.name}`
    const { error } = await supabase.storage.from('short-videos').upload(path, renamed, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    return getVideoPublicUrlFromPath(path)
  }

  const addShort = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitLoading(true)
    try {
      let videoUrl: string | null = form.videoUrl?.trim() || null
      if (videoFile) {
        try {
          videoUrl = await uploadVideo(videoFile)
        } catch {
          setErrorMsg('Не удалось загрузить видео файл')
          videoUrl = null
        }
      }
      const payload: Omit<Case, 'id'> = {
        title: form.title,
        description: form.shortDescription || '',
        image: null,
        category: 'Shorts',
        rating: 0,
        year: new Date().getFullYear(),
        is_short: true,
        video_url: videoUrl,
        short_description: form.shortDescription || null,
      }
      const { error } = await supabase.from('cases').insert([payload])
      if (error) {
        setErrorMsg(t.admin.save_error)
      } else {
        await fetchItems()
        setForm({
          title: '',
          videoUrl: '',
          shortDescription: '',
        })
        setVideoFile(null)
        setSuccessMsg(t.admin.add_success)
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = (c: Case) => {
    setEditingId(c.id)
    setEditForm({
      title: c.title,
      videoUrl: c.video_url || '',
      shortDescription: c.short_description || '',
    })
    setVideoFile(null)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitLoading(true)
    let videoUrl: string | null = editForm.videoUrl?.trim() || null
    if (videoFile) {
      try {
        const newVideoUrl = await uploadVideo(videoFile)
        const oldPath = editForm.videoUrl ? extractVideoStoragePathFromUrl(editForm.videoUrl) : null
        if (oldPath) {
          await supabase.storage.from('short-videos').remove([oldPath])
        }
        videoUrl = newVideoUrl
      } catch {
        setErrorMsg('Не удалось загрузить видео файл')
        videoUrl = null
      }
    }
    const payload: Partial<Case> = {
      title: editForm.title,
      description: editForm.shortDescription || '',
      image: null,
      category: 'Shorts',
      rating: 0,
      year: new Date().getFullYear(),
      is_short: true,
      video_url: videoUrl,
      short_description: editForm.shortDescription || null,
    }
    await supabase.from('cases').update(payload).match({ id: Number(editingId) })
    await fetchItems()
    setEditingId(null)
    setEditForm({
      title: '',
      videoUrl: '',
      shortDescription: '',
    })
    setVideoFile(null)
    setSubmitLoading(false)
  }

  const handleDelete = async (c: Case) => {
    const ok = window.confirm('Вы уверены, что хотите удалить это дело?')
    if (!ok) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      if (c.video_url) {
        const vpath = extractVideoStoragePathFromUrl(c.video_url)
        if (vpath) {
          await supabase.storage.from('short-videos').remove([vpath])
        }
      }
      const { error: dbError } = await supabase.from('cases').delete().eq('id', Number(c.id))
      if (dbError) {
        setErrorMsg(t.admin.delete_error)
        return
      }
      setSuccessMsg(t.admin.delete_success)
      await fetchItems()
    } catch {
      setErrorMsg(t.admin.delete_error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
        <h3 className="text-lg font-semibold">Добавить/Редактировать Short</h3>
        <div className="mt-4 space-y-3">
          {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
          {successMsg && <p className="text-sm text-green-400">{successMsg}</p>}
          {!editingId ? (
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t.admin.field_title}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          ) : (
            <input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder={t.admin.field_title}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          )}
          <div>
            <p className="text-xs text-gray-400 mb-1">Видео файл (MP4)</p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null
                setVideoFile(f)
              }}
              className="w-full rounded-md bg-brand-dark text-white file:text-white file:bg-brand-dark file:border file:border-white/10 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          </div>
          {!editingId ? (
            <textarea
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Короткое описание"
              rows={3}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          ) : (
            <textarea
              value={editForm.shortDescription}
              onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
              placeholder="Короткое описание"
              rows={3}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          )}
          {editingId ? (
            <div>
              <button
                disabled={submitLoading}
                onClick={handleUpdate}
                className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                    </svg>
                  </span>
                ) : (
                  t.admin.update_case
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setEditForm({
                    title: '',
                    videoUrl: '',
                    shortDescription: '',
                  })
                  setErrorMsg(null)
                  setVideoFile(null)
                }}
                className="mt-2 w-full rounded-md bg-brand-dark text-white font-semibold py-2 border border-white/10 hover:bg-brand-dark/80 transition"
              >
                {t.admin.cancel_edit}
              </button>
            </div>
          ) : (
            <button
              disabled={disabled || submitLoading}
              onClick={addShort}
              className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                  </svg>
                </span>
              ) : (
                'Добавить Short'
              )}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
        <h3 className="text-lg font-semibold">Список Shorts</h3>
        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-gray-400">{t.common.loading}</p>}
          {!loading && items.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify между gap-3 rounded-md bg-brand-dark px-3 py-2 border border-white/10"
            >
              <div className="flex items-center gap-3">
                {c.image ? (
                  <img src={c.image ?? undefined} alt={c.title} className="w-12 h-16 object-cover rounded" />
                ) : (
                  <div className="w-12 h-16 rounded bg-gradient-to-b from-[#1f1f1f] to-[#0e0e0e] border border-white/10" />
                )}
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-gray-400">Short • {c.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-2 bg-brand-dark text-white border border-white/10 hover:bg-brand-dark/80 transition"
                  title={t.common.edit}
                >
                  {t.common.edit}
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-2 bg-brand-red text-white hover:bg-brand-red/90 transition"
                  title={t.common.delete}
                >
                  <Trash className="w-4 h-4" />
                  <span>{t.common.delete}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
