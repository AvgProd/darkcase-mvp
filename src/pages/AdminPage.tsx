import React, { useMemo, useState } from 'react'
import { CASES } from '../data/mockData'
import type { Case } from '../types'
import { Trash } from 'lucide-react'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [cases, setCases] = useState<Case[]>(CASES)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'Trending' | 'Serial Killers' | 'Unsolved'>('Trending')
  const [image, setImage] = useState('')
  const [videoId, setVideoId] = useState('')
  const [rating, setRating] = useState('')
  const [description, setDescription] = useState('')

  const disabled = useMemo(
    () => !title || !image || !videoId || !rating || !description,
    [title, image, videoId, rating, description]
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

  const addCase = () => {
    if (disabled) return
    const newCase: Case = {
      id: `admin-${Date.now()}`,
      title,
      description,
      image,
      category,
      rating,
      year: new Date().getFullYear(),
      videoId,
    }
    setCases((prev) => [newCase, ...prev])
    setTitle('')
    setImage('')
    setVideoId('')
    setRating('')
    setDescription('')
    setCategory('Trending')
  }

  const deleteCase = (id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id))
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-sm rounded-xl bg-brand-dark/80 border border-white/10 p-6">
          <h1 className="text-xl font-bold text-center">Admin Login</h1>
          <p className="mt-1 text-center text-gray-400">Restricted Area</p>
          <div className="mt-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
          </div>
          <button
            onClick={handleLogin}
            className="mt-4 w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition"
          >
            Unlock Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10">
        <h2 className="text-2xl font-bold text-brand-red">DarkCase HQ</h2>
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-2 bg-brand-dark border border-white/10 hover:bg-brand-dark/80 transition"
        >
          Logout
        </button>
      </header>

      <main className="px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
          <h3 className="text-lg font-semibold">Add Case</h3>
          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'Trending' | 'Serial Killers' | 'Unsolved')
              }
              className="w-full rounded-md bg-brand-dark text-white px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            >
              <option value="Trending">Trending</option>
              <option value="Serial Killers">Serial Killers</option>
              <option value="Unsolved">Unsolved</option>
            </select>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Image URL"
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="YouTube Video ID"
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <input
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Rating (e.g., 9.8)"
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full rounded-md bg-brand-dark text-white placeholder-gray-400 px-3 py-2 outline-none border border-white/10 focus:border-white/20"
            />
            <button
              disabled={disabled}
              onClick={addCase}
              className="w-full rounded-md bg-brand-red text-white font-semibold py-2 hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ADD CASE
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-brand-dark/60 border border-white/10 p-4">
          <h3 className="text-lg font-semibold">Manage Cases</h3>
          <div className="mt-4 space-y-3">
            {cases.map((c) => (
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
                  title="Delete"
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
