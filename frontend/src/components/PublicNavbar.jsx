import { Link } from 'react-router-dom'

// Provide simple navigation for public pages.
export default function PublicNavbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-lg font-semibold text-indigo-600">ChurnGuard</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600">About</Link>
          <Link to="/contact" className="text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600">Contact</Link>
          <Link to="/login" className="text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600">Login</Link>
          <Link to="/signup" className="rounded-md bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600">Signup</Link>
        </nav>
      </div>
    </header>
  )
}
