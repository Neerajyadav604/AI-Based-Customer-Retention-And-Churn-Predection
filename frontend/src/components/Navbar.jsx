import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  ['Home', '/'],
  ['Predict', '/predict'],
  ['Upload', '/upload'],
  ['Dashboard', '/dashboard'],
  ['Insights', '/insights'],
  ['History', '/history'],
]

// Show the main navigation on every page.
export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-blue-700">
          ChurnGuard
        </Link>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-2 text-sm md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
        <nav className={`${menuOpen ? 'block' : 'hidden'} absolute left-0 top-[73px] z-10 w-full border-b border-slate-200 bg-white p-4 md:static md:block md:w-auto md:border-0 md:p-0`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
            {links.map(([label, path]) => (
              <Link key={path} to={path} className="text-sm text-slate-600 hover:text-blue-700" onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-700">Hi, {user.name}</span>
                <button type="button" onClick={logout} className="text-left text-sm text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-blue-700" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="rounded bg-blue-700 px-3 py-2 text-center text-sm text-white" onClick={() => setMenuOpen(false)}>Signup</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
