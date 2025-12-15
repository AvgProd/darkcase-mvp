import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ShortsPage from './pages/ShortsPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import CasePage from './pages/CasePage'

export default function App() {
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
