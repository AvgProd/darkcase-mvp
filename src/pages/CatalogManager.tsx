import React, { useEffect, useMemo, useState } from 'react'
import type { Case } from '../types/Case'
import { Trash } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useT } from '../hooks/useTranslation'

type CatalogForm = {
  title: string
  category: string
  image: string
  rating: string
  year: string
  description: string
}
type EditForm = {
  title: string
  category: string
  image: string
  rating: string
  year: string
  description: string
}

export default function CatalogManager() {
  const t = useT()
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [catalogForm, setCatalogForm] = useState<CatalogForm>({
    title: '',
    category: '',
    image: '',
    rating: '',
    year: '',
    description: '',
  })
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    category: '',
    image: '',
    rating: '',
    year: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const disabled = useMemo(
    () =>
      !catalogForm.title ||
      !catalogForm.rating ||
      !catalogForm.year ||
      !catalogForm.description ||
      !catalogForm.category,
    [catalogForm]
  )

  const fetchCases = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cases').select('*')
    const list = !error && data ? (data as Case[]) : []
    setCases(list.filter((c) => !c.is_short))
    setLoading(false)
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const compressImage = async (file: File, maxHeight = 1280, maxWidth = 720, targetSize = 250 * 1024) => {
    const toDataURL = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(f)
      })
    const src = await toDataURL(file)
    const img = new Image()
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = rej
      img.src = src
    })
    const targetAspect = 9 / 16
    const srcAspect = img.width / img.height
    let targetH = Math.min(img.height, maxHeight)
    let targetW = Math.floor(targetH * targetAspect)
    if (targetW > maxWidth) {
      targetW = maxWidth
      targetH = Math.floor(maxWidth * (16 / 9))
    }
    let cropW: number
    let cropH: number
    let sx: number
    let sy: number
    if (srcAspect > targetAspect) {
      cropH = img.height
      cropW = Math.floor(cropH * targetAspect)
      sx = Math.floor((img.width - cropW) / 2)
      sy = 0
    } else {
      cropW = img.width
      cropH = Math.floor(cropW / targetAspect)
      sx = 0
      sy = Math.floor((img.height - cropH) / 2)
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    let currentW = targetW
    let currentH = targetH
    canvas.width = currentW
    canvas.height = currentH
    ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, currentW, currentH)
    let quality = 0.82
    let blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    let iterations = 0
    while (blob && blob.size > targetSize && iterations < 20) {
      if (quality > 0.4) {
        quality -= 0.08
      } else {
        currentW = Math.max(120, Math.floor(currentW * 0.9))
        currentH = Math.max(213, Math.floor(currentH * 0.9))
        canvas.width = currentW
        canvas.height = currentH
        ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, currentW, currentH)
      }
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
      )
      iterations += 1
    }
    if (!blob) throw new Error('Image compression failed')
    if (blob.size > targetSize) throw new Error('Image exceeds target size after compression')
    const safeName = `case-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
    return new File([blob], safeName, { type: 'image/jpeg' })
  }

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
    const optimized = await compressImage(file)
    const path = `uploads/${optimized.name}`
    const { error } = await supabase.storage.from('case-images').upload(path, optimized, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    return getPublicUrlFromPath(path)
  }

  const addCase = async () => {
    if (disabled) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitLoading(true)
    try {
      let imageUrl = catalogForm.image?.trim() || ''
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile)
        } catch {
          setErrorMsg(t.admin.upload_failed)
          imageUrl = ''
        }
      }
      const payload: Omit<Case, 'id'> = {
        title: catalogForm.title,
        description: catalogForm.description,
        image: imageUrl || null,
        category: catalogForm.category?.trim() || 'General',
        rating: parseFloat(catalogForm.rating),
        year: parseInt(catalogForm.year, 10),
        is_short: false,
        video_url: null,
        short_description: null,
      }
      const { error } = await supabase.from('cases').insert([payload])
      if (error) {
        setErrorMsg(t.admin.save_error)
      } else {
        await fetchCases()
        setCatalogForm({
          title: '',
          category: '',
          image: '',
          rating: '',
          year: '',
          description: '',
        })
        setImageFile(null)
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
      category: c.category || '',
      image: c.image || '',
      rating: String(c.rating ?? ''),
      year: String(c.year ?? ''),
      description: c.description || '',
    })
    setImageFile(null)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitLoading(true)
    let imageUrl = editForm.image?.trim() || ''
    if (imageFile) {
      try {
        const newUrl = await uploadImage(imageFile)
        const oldPath = editForm.image ? extractStoragePathFromUrl(editForm.image) : null
        if (oldPath) {
          await supabase.storage.from('case-images').remove([oldPath])
        }
        imageUrl = newUrl
      } catch {
        setErrorMsg(t.admin.upload_failed)
        imageUrl = editForm.image || ''
      }
    }
    const payload: Partial<Case> = {
      title: editForm.title,
      description: editForm.description,
      image: imageUrl,
      category: editForm.category?.trim() || 'General',
      rating: parseFloat(editForm.rating),
      year: parseInt(editForm.year, 10),
      is_short: false,
      video_url: null,
      short_description: null,
    }
    await supabase.from('cases').update(payload).match({ id: Number(editingId) })
    await fetchCases()
    setEditingId(null)
    setEditForm({
      title: '',
      category: '',
      image: '',
      rating: '',
      year: '',
      description: '',
    })
    setImageFile(null)
    setSubmitLoading(false)
  }

  const handleDeleteCase = async (c: Case) => {
    const ok = window.confirm('Вы уверены, что хотите удалить это дело?')
    if (!ok) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      if (c.image) {
        const path = extractStoragePathFromUrl(c.image)
        if (path) {
          await supabase.storage.from('case-images').remove([path])
        }
      }
      const { error: dbError } = await supabase.from('cases').delete().eq('id', Number(c.id))
      if (dbError) {
        setErrorMsg(t.admin.delete_error)
        return
      }
      setSuccessMsg(t.admin.delete_success)
      await fetchCases()
    } catch {
      setErrorMsg(t.admin.delete_error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
        <h3 className="text-lg font-semibold">{t.admin.add_case}</h3>
        <div className="mt-4 space-y-3">
          {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
          {successMsg && <p className="text-sm text-green-400">{successMsg}</p>}
          {!editingId ? (
            <>
              <input
                value={catalogForm.title}
                onChange={(e) => setCatalogForm({ ...catalogForm, title: e.target.value })}
                placeholder={t.admin.field_title}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
              <input
                type="text"
                value={catalogForm.category}
                onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
                placeholder={t.admin.field_category}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
            </>
          ) : (
            <>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder={t.admin.field_title}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                placeholder={t.admin.field_category}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
            </>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-1">{t.admin.field_image_file}</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null
                setImageFile(f)
              }}
              className="w-full rounded-md bg-brand-dark text-white file:text-white file:bg-brand-dark file:border file:border-white/10 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          </div>
          {!editingId ? (
            <>
              <input
                value={catalogForm.rating}
                onChange={(e) => setCatalogForm({ ...catalogForm, rating: e.target.value })}
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder={t.admin.field_rating}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
              <input
                value={catalogForm.year}
                onChange={(e) => setCatalogForm({ ...catalogForm, year: e.target.value })}
                type="number"
                inputMode="numeric"
                placeholder={t.admin.field_year}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
              <textarea
                value={catalogForm.description}
                onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })}
                placeholder={t.admin.field_description}
                rows={4}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
            </>
          ) : (
            <>
              <input
                value={editForm.rating}
                onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder={t.admin.field_rating}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
              <input
                value={editForm.year}
                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                type="number"
                inputMode="numeric"
                placeholder={t.admin.field_year}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder={t.admin.field_description}
                rows={4}
                className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
              />
            </>
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
                    category: '',
                    image: '',
                    rating: '',
                    year: '',
                    description: '',
                  })
                  setErrorMsg(null)
                }}
                className="mt-2 w-full rounded-md bg-brand-dark text-white font-semibold py-2 border border-white/10 hover:bg-brand-dark/80 transition"
              >
                {t.admin.cancel_edit}
              </button>
            </div>
          ) : (
            <button
              disabled={disabled || submitLoading}
              onClick={addCase}
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
                t.admin.add_case_cta
              )}
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
                {c.image ? (
                  <img
                    src={c.image || ''}
                    alt={c.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 rounded bg-gradient-to-b from-[#1f1f1f] to-[#0e0e0e] border border-white/10" />
                )}
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.category} • {c.rating}</p>
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
                  onClick={() => handleDeleteCase(c)}
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
