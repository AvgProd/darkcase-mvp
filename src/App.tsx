import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ShortsPage from './pages/ShortsPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import CasePage from './pages/CasePage'
import WebApp from '@twa-dev/sdk'

export default function App() {
  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    WebApp.setHeaderColor('#000000')
    WebApp.setBackgroundColor('#000000')
  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shorts" element={<ShortsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="case/:id" element={<CasePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
