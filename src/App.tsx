import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ShortsPage from './pages/ShortsPage'
import CatalogPage from './pages/CatalogPage'
import ProfilePage from './pages/ProfilePage'
import CasePage from './pages/CasePage'
import AdminPage from './pages/AdminPage'
import { TelegramInitializer } from './components/TelegramInitializer'
import MyContentPage from './pages/MyContentPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-black text-white min-h-screen">
        <TelegramInitializer />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shorts" element={<ShortsPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="my" element={<MyContentPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="case/:id" element={<CasePage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
