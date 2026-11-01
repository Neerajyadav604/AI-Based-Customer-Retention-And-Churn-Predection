import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileMenu from './ProfileMenu'

const publicLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Pricing', '/pricing'],
  ['Docs', '/docs'],
]

// Show the same navigation for public and authenticated users.
export default function GlobalNavbar({ transparent = false }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.is_admin === true

  function closeMenu() {
    setOpen(false)
  }

  return (
    <header className={`relative z-50 ${transparent ? 'absolute inset-x-0 top-0 border-b border-white/10 bg-transparent text-white' : 'border-b border-indigo-100 bg-white'}`}>
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className={`font-semibold focus-visible:ring-2 focus-visible:ring-blue-400 ${transparent ? 'text-white' : 'text-indigo-600'}`}>ChurnGuard</Link>
        <button type="button" onClick={() => setOpen(!open)} className={`rounded-md p-2 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 md:hidden ${transparent ? 'text-white' : 'text-slate-500 hover:bg-slate-100'}`} aria-label="Toggle navigation">
          Menu
        </button>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 ${transparent ? 'border-white/10 bg-[#071426]' : 'border-slate-200 bg-white'}`}>
          {publicLinks.map(([label, path]) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={closeMenu} className={({ isActive }) => `rounded px-3 py-2 text-sm ${isActive ? 'text-blue-300' : transparent ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              {label}
            </NavLink>
          ))}
          {isAdmin && <NavLink to="/workspace/admin" onClick={closeMenu} className={`rounded px-3 py-2 text-sm ${transparent ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Admin</NavLink>}
        </nav>
        <div className={`${open ? 'flex' : 'hidden'} absolute right-4 top-full flex-col gap-2 border-b p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 ${transparent ? 'border-white/10 bg-[#071426]' : 'border-slate-200 bg-white'}`}>
          {user ? (
            <>
              <Link to="/workspace" onClick={closeMenu} className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600">Launch Workspace</Link>
              <ProfileMenu />
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className={`text-sm focus-visible:ring-2 focus-visible:ring-blue-400 ${transparent ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Login</Link>
              <Link to="/workspace" onClick={closeMenu} className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600">Launch Workspace</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
