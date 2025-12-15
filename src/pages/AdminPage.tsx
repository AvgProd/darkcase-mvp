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
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'catalog' | 'shorts'>('catalog')

  type NewCaseForm = {
    title: string
    category: string
    image: string
    rating: string
    year: string
    description: string
    isShort: boolean
    videoUrl: string
    shortDescription: string
  }
  const [newCase, setNewCase] = useState<NewCaseForm>({
    title: '',
    category: '',
    image: '',
    rating: '',
    year: '',
    description: '',
    isShort: false,
    videoUrl: '',
    shortDescription: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const disabled = useMemo(
    () =>
      !newCase.title ||
      !newCase.rating ||
      !newCase.year ||
      !newCase.description ||
      !newCase.category,
    [newCase]
  )
  const disabledShort = useMemo(
    () => !newCase.title || (!videoFile && !newCase.videoUrl),
    [newCase.title, videoFile, newCase.videoUrl]
  )
  const regularCases = useMemo(() => cases.filter((c) => !c.is_short), [cases])
  const shortsCases = useMemo(() => cases.filter((c) => !!c.is_short), [cases])

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
    setTimeout(() => {
      fetchCases()
    }, 0)
  }, [])

  const extractStoragePathFromUrl = (url: string) => {
    const marker = '/object/public/case-images/'
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.substring(idx + marker.length)
  }
  const extractVideoStoragePathFromUrl = (url: string) => {
    const marker = '/object/public/short-videos/'
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.substring(idx + marker.length)
  }

  const getPublicUrlFromPath = (path: string) => {
    const { data } = supabase.storage.from('case-images').getPublicUrl(path)
    return data.publicUrl
  }
  const getVideoPublicUrlFromPath = (path: string) => {
    const { data } = supabase.storage.from('short-videos').getPublicUrl(path)
    return data.publicUrl
  }

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

  const deleteOldImageIfNeeded = async (url?: string) => {
    if (!url) return
    const path = extractStoragePathFromUrl(url)
    if (!path) return
    await supabase.storage.from('case-images').remove([path])
  }

  const addCase = async () => {
    if (!newCase.isShort && disabled) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitLoading(true)
    try {
      if (newCase.isShort) {
        let videoUrl = newCase.videoUrl?.trim() || ''
        if (videoFile) {
          try {
            videoUrl = await uploadVideo(videoFile)
          } catch (err) {
            console.error('Supabase upload error (video):', err)
            setErrorMsg(t.admin.upload_failed)
            setSubmitLoading(false)
            return
          }
        }
        const payload: Omit<Case, 'id'> = {
          title: newCase.title,
          description: newCase.shortDescription || '',
          image: '',
          category: 'Shorts',
          rating: 0,
          year: new Date().getFullYear(),
          is_short: true,
          video_url: videoUrl || '',
          short_description: newCase.shortDescription || null,
        }
        const { error } = await supabase.from('cases').insert([payload])
        if (error) {
          setErrorMsg(t.admin.save_error)
        } else {
          await fetchCases()
          setNewCase({
            title: '',
            category: '',
            image: '',
            isShort: false,
            videoUrl: '',
            shortDescription: '',
            rating: '',
            year: '',
            description: '',
          })
          setImageFile(null)
          setVideoFile(null)
          setSuccessMsg(t.admin.add_success)
        }
      } else {
        let imageUrl = newCase.image?.trim() || ''
        if (imageFile) {
          try {
            imageUrl = await uploadImage(imageFile)
          } catch (err) {
            console.error('Supabase upload error:', err)
            setErrorMsg(t.admin.upload_failed)
            imageUrl = ''
          }
        }
        const payload: Omit<Case, 'id'> = {
          title: newCase.title,
          description: newCase.description,
          image: imageUrl || '',
          category: newCase.category?.trim() || 'General',
          rating: parseFloat(newCase.rating),
          year: parseInt(newCase.year, 10),
          is_short: false,
          video_url: '',
          short_description: null,
        }
        const { error } = await supabase.from('cases').insert([payload])
        if (error) {
          setErrorMsg(t.admin.save_error)
        } else {
          await fetchCases()
          setNewCase({
            title: '',
            category: '',
            image: '',
            isShort: false,
            videoUrl: '',
            shortDescription: '',
            rating: '',
            year: '',
            description: '',
          })
          setImageFile(null)
          setSuccessMsg(t.admin.add_success)
        }
      }
    } finally {
      setSubmitLoading(false)
    }
  }
  const addShort = async () => {
    setNewCase((prev) => ({ ...prev, isShort: true }))
    await addCase()
  }

  const handleEdit = (c: Case) => {
    setEditingId(c.id)
    setNewCase({
      title: c.title,
      category: c.category || '',
      image: c.image || '',
      rating: String(c.rating ?? ''),
      year: String(c.year ?? ''),
      description: c.description || '',
      isShort: !!c.is_short,
      videoUrl: c.video_url || '',
      shortDescription: c.short_description || '',
    })
    setImageFile(null)
    setVideoFile(null)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitLoading(true)
    let imageUrl = newCase.image?.trim() || ''
    if (imageFile) {
      try {
        const newUrl = await uploadImage(imageFile)
        await deleteOldImageIfNeeded(newCase.image)
        imageUrl = newUrl
      } catch (err) {
        console.error('Supabase upload error:', err)
        setErrorMsg(t.admin.upload_failed)
        imageUrl = newCase.image || ''
      }
    }
    let videoUrl = newCase.videoUrl?.trim() || ''
    if (newCase.isShort && videoFile) {
      try {
        const newVideoUrl = await uploadVideo(videoFile)
        const oldPath = newCase.videoUrl ? extractVideoStoragePathFromUrl(newCase.videoUrl) : null
        if (oldPath) {
          await supabase.storage.from('short-videos').remove([oldPath])
        }
        videoUrl = newVideoUrl
      } catch (err) {
        console.error('Supabase upload error (video):', err)
        setErrorMsg(t.admin.upload_failed)
        videoUrl = newCase.videoUrl || ''
      }
    }
    const payload: Partial<Case> = {
      title: newCase.title,
      description: newCase.isShort ? (newCase.shortDescription || '') : newCase.description,
      image: imageUrl,
      category: newCase.isShort ? 'Shorts' : (newCase.category?.trim() || 'General'),
      rating: newCase.isShort ? 0 : parseFloat(newCase.rating),
      year: newCase.isShort ? new Date().getFullYear() : parseInt(newCase.year, 10),
      is_short: newCase.isShort,
      video_url: newCase.isShort ? videoUrl : '',
      short_description: newCase.isShort ? (newCase.shortDescription || null) : null,
    }
    await supabase.from('cases').update(payload).match({ id: Number(editingId) })
    await fetchCases()
    setEditingId(null)
    setNewCase({
      title: '',
      category: '',
      image: '',
      isShort: false,
      videoUrl: '',
      shortDescription: '',
      rating: '',
      year: '',
      description: '',
    })
    setImageFile(null)
    setVideoFile(null)
    setSubmitLoading(false)
  }

  const handleDeleteCase = async (caseId: string | number, imageUrl?: string | null, videoUrl?: string | null) => {
    const ok = window.confirm('Вы уверены, что хотите удалить это дело?')
    if (!ok) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      if (imageUrl) {
        const path = extractStoragePathFromUrl(imageUrl)
        if (path) {
          const { error: storageError } = await supabase.storage.from('case-images').remove([path])
          if (storageError) {
            console.error('Storage delete error:', storageError)
          }
        }
      }
      if (videoUrl) {
        const vpath = extractVideoStoragePathFromUrl(videoUrl)
        if (vpath) {
          const { error: vErr } = await supabase.storage.from('short-videos').remove([vpath])
          if (vErr) {
            console.error('Storage delete error:', vErr)
          }
        }
      }
      const { error: dbError } = await supabase.from('cases').delete().eq('id', Number(caseId))
      if (dbError) {
        setErrorMsg(t.admin.delete_error)
        return
      }
      setSuccessMsg(t.admin.delete_success)
      await fetchCases()
    } catch (e) {
      console.error('Delete case error:', e)
      setErrorMsg(t.admin.delete_error)
    }
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

      <main className="px-4 md:px-8 py-6">
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('catalog')}
              className={'px-3 py-2 text-sm font-medium ' + (activeTab === 'catalog' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white')}
            >
              Управление Каталогом
            </button>
            <button
              onClick={() => setActiveTab('shorts')}
              className={'px-3 py-2 text-sm font-medium ' + (activeTab === 'shorts' ? 'text-brand-red border-b-2 border-brand-red' : 'text-gray-400 hover:text-white')}
            >
              Управление Shorts
            </button>
          </div>
          
          <div className={'mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 ' + (activeTab === 'catalog' ? '' : 'hidden')}>
        <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
          <h3 className="text-lg font-semibold">{t.admin.add_case}</h3>
          <div className="mt-4 space-y-3">
            {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-green-400">{successMsg}</p>}
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
              placeholder={t.admin.field_category}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
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
            
            <input
              value={newCase.rating}
              onChange={(e) => setNewCase({ ...newCase, rating: e.target.value })}
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder={t.admin.field_rating}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              value={newCase.year}
              onChange={(e) => setNewCase({ ...newCase, year: e.target.value })}
              type="number"
              inputMode="numeric"
              placeholder={t.admin.field_year}
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
              <div>
                <button
                  disabled={disabled || submitLoading}
                  onClick={handleUpdate}
                  className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                      </svg>
                      {t.common.loading}
                    </span>
                  ) : (
                    t.admin.update_case
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setNewCase({
                      title: '',
                      category: '',
                      image: '',
                      isShort: false,
                      videoUrl: '',
                      shortDescription: '',
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
                    {t.common.loading}
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
            {!loading && regularCases.map((c) => (
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
                    title={t.common.edit}
                  >
                    {t.common.edit}
                  </button>
                <button
                  onClick={() => handleDeleteCase(c.id, c.image, c.video_url)}
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
          
          <div className={'mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 ' + (activeTab === 'shorts' ? '' : 'hidden')}>
        
        <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
          <h3 className="text-lg font-semibold">Добавить/Редактировать Short</h3>
          <div className="mt-4 space-y-3">
            {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-green-400">{successMsg}</p>}
            <input
              value={newCase.title}
              onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
              placeholder={t.admin.field_title}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
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
            <textarea
              value={newCase.shortDescription}
              onChange={(e) => setNewCase({ ...newCase, shortDescription: e.target.value })}
              placeholder="Короткое описание"
              rows={3}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            {editingId && newCase.isShort ? (
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
                      {t.common.loading}
                    </span>
                  ) : (
                    t.admin.update_case
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setNewCase({
                      title: '',
                      category: '',
                      image: '',
                      isShort: false,
                      videoUrl: '',
                      shortDescription: '',
                      rating: '',
                      year: '',
                      description: '',
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
                disabled={disabledShort || submitLoading}
                onClick={addShort}
                className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                    </svg>
                    {t.common.loading}
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
            {!loading && shortsCases.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-md bg-brand-dark px-3 py-2 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {c.image ? (
                    <img src={c.image} alt={c.title} className="w-12 h-16 object-cover rounded" />
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
                    onClick={() => handleDeleteCase(c.id, c.image, c.video_url)}
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
        </div>
      </main>
    </div>
  )
}
