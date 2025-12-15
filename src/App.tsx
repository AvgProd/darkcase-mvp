import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ShortsPage from './pages/ShortsPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import CasePage from './pages/CasePage'
import AdminPage from './pages/AdminPage'
import { TelegramInitializer } from './components/TelegramInitializer'

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-black text-white min-h-screen">
        <TelegramInitializer />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shorts" element={<ShortsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="case/:id" element={<CasePage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
