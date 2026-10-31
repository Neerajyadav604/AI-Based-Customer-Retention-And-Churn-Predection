import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  ['Dashboard', '/dashboard'],
  ['Predict', '/predict'],
  ['Batch Upload', '/upload'],
  ['Model Insights', '/insights'],
  ['History', '/history'],
  ['Recommendations', '/recommendations'],
  ['Profile', '/profile'],
]

// Provide the protected application navigation and content area.
export default function AppShell({ children }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-900/30 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-60 border-r border-slate-200 bg-white transition-transform md:translate-x-0`}>
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Link to="/" className="text-lg font-semibold text-indigo-600">ChurnGuard</Link>
        </div>
        <nav className="space-y-1 p-3">
          {links.map(([label, path]) => (
            <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `block rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="md:pl-60">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600 md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">Menu</button>
          <div className="ml-auto flex items-center gap-4 text-sm">
            {user ? (
              <>
                <span className="text-slate-500">{user.name}</span>
                <button type="button" onClick={logout} className="font-medium text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600">Logout</button>
              </>
            ) : (
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600">Login</Link>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
