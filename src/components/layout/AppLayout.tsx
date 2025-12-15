import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-brand-black text-white">
      <div className="pb-28">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
