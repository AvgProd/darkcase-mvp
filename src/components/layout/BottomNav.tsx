import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Film, Search, User, Bookmark } from 'lucide-react'
import clsx from 'clsx'
import { useT } from '../../hooks/useTranslation'

export default function BottomNav() {
  const t = useT()
  const itemBase = 'flex flex-col items-center justify-center gap-1'
  const iconBase = 'w-6 h-6'
  const labelBase = 'text-xs'

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] rounded-2xl bg-[#141414]/90 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50 z-50">
      <div className="flex justify-around items-center py-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            clsx(itemBase, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          {({ isActive }: { isActive?: boolean }) => (
            <>
              <Home className={iconBase} />
              <span className={labelBase}>{t.nav.home}</span>
              {isActive ? <div className="mt-1 h-1 w-5 rounded-full bg-brand-red" /> : null}
            </>
          )}
        </NavLink>
        <NavLink
          to="/shorts"
          className={({ isActive }) =>
            clsx(itemBase, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          {({ isActive }: { isActive?: boolean }) => (
            <>
              <Film className={iconBase} />
              <span className={labelBase}>{t.nav.shorts}</span>
              {isActive ? <div className="mt-1 h-1 w-5 rounded-full bg-brand-red" /> : null}
            </>
          )}
        </NavLink>
        <NavLink
          to="/catalog"
          className={({ isActive }) =>
            clsx(itemBase, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          {({ isActive }: { isActive?: boolean }) => (
            <>
              <Search className={iconBase} />
              <span className={labelBase}>{t.nav.catalog}</span>
              {isActive ? <div className="mt-1 h-1 w-5 rounded-full bg-brand-red" /> : null}
            </>
          )}
        </NavLink>
        <NavLink
          to="/my"
          className={({ isActive }) =>
            clsx(itemBase, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          {({ isActive }: { isActive?: boolean }) => (
            <>
              <Bookmark className={iconBase} />
              <span className={labelBase}>{t.nav.my}</span>
              {isActive ? <div className="mt-1 h-1 w-5 rounded-full bg-brand-red" /> : null}
            </>
          )}
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            clsx(itemBase, isActive ? 'text-brand-red' : 'text-gray-500')
          }
        >
          {({ isActive }: { isActive?: boolean }) => (
            <>
              <User className={iconBase} />
              <span className={labelBase}>{t.nav.profile}</span>
              {isActive ? <div className="mt-1 h-1 w-5 rounded-full bg-brand-red" /> : null}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
