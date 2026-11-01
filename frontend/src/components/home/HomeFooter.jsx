import { Link } from 'react-router-dom'

// Show the simple landing page footer.
export default function HomeFooter() {
  return (
    <footer className="border-t border-indigo-100 bg-[#f2f3ff]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs sm:px-8">
        <div><p className="font-semibold text-slate-900">ChurnGuard</p><p className="text-slate-500">Final-year B.Tech project</p></div>
        <nav className="flex gap-4 text-slate-500">
          <Link to="/login" className="hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600">Login</Link>
          <Link to="/signup" className="hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600">Sign up</Link>
          <Link to="/contact" className="hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600">Contact</Link>
        </nav>
      </div>
    </footer>
  )
}
