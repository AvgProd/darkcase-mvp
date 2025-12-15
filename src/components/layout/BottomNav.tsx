import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Film, Search, User } from 'lucide-react'
import clsx from 'clsx'

export default function BottomNav() {
  const baseItem = 'flex flex-col items-center justify-center gap-1 py-2'
  const iconBase = 'w-6 h-6'

  return (
    <nav className="fixed bottom-0 w-full bg-brand-dark border-t border-white/10">
      <div className="mx-auto max-w-md grid grid-cols-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            clsx(baseItem, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          <Home className={clsx(iconBase)} />
        </NavLink>
        <NavLink
          to="/shorts"
          className={({ isActive }) =>
            clsx(baseItem, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          <Film className={clsx(iconBase)} />
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            clsx(baseItem, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          <Search className={clsx(iconBase)} />
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            clsx(baseItem, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          <User className={clsx(iconBase)} />
        </NavLink>
      </div>
    </nav>
  )
}
