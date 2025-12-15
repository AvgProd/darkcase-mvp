import React, { useState } from 'react'
import { useT } from '../hooks/useTranslation'
import CatalogManager from './CatalogManager'
import ShortsManager from './ShortsManager'

export default function AdminPage() {
  const t = useT()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'catalog' | 'shorts'>('catalog')

  const handleLogin = () => {
    if (password === 'admin123') {
      setAuthenticated(true)
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setPassword('')
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

          <div className="mt-6">
            {activeTab === 'catalog' ? <CatalogManager /> : <ShortsManager />}
          </div>
        </div>
      </main>
    </div>
  )
}
