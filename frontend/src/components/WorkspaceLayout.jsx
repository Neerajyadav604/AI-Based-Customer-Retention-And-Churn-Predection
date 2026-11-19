import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PlanStatus from './PlanStatus'
import Spinner from './Spinner'
import ProfileMenu from './ProfileMenu'
import Icon from './Icon'
import { DoodleSparkle } from './Doodles'

const links = [
  ['Overview', '/workspace', 'overview'],
  ['Single Predict', '/workspace/predict', 'predict'],
  ['Batch Prediction', '/workspace/upload', 'upload'],
  ['All Predictions', '/workspace/predictions', 'history'],
  ['Data Management', '/workspace/data', 'database'],
  ['Model Insights', '/workspace/insights', 'insights'],
  ['Upload History', '/workspace/history', 'history'],
  ['Recommendations', '/workspace/recommendations', 'recommendations'],
]

export default function WorkspaceLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [preparing, setPreparing] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const timer = window.setTimeout(() => setPreparing(false), 600)
    return () => window.clearTimeout(timer)
  }, [])

  if (preparing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8ED] text-[#494269]">
        <div className="relative mb-4">
          <div className="size-16 rounded-2xl bg-[#494269] flex items-center justify-center text-[#E6B95F] shadow-lg animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" className="size-8 stroke-current stroke-2">
              <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <DoodleSparkle size={20} className="absolute -top-2 -right-2 text-[#E6B95F]" />
        </div>
        <Spinner label="Opening your retention workspace..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E4] text-[#291C2E]">
      {/* Mobile Backdrop */}
      {menuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-[#291C2E]/60 backdrop-blur-xs md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Deep Muted Purple Editorial Sidebar */}
      <aside
        className={`${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 flex w-68 flex-col bg-gradient-to-b from-[#291C2E] via-[#373152] to-[#291C2E] text-[#FFF3E4] transition-transform duration-300 md:translate-x-0 shadow-xl border-r border-[#373152]`}
      >
        {/* Brand header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#373152]">
          <Link to="/" className="flex items-center gap-2.5 font-editorial text-2xl font-bold tracking-tight">
            <span>Churn<span className="text-[#E6B95F]">Guard</span></span>
            <span className="rounded-full bg-[#E6B95F]/20 border border-[#E6B95F]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E6B95F]">
              AI
            </span>
          </Link>
          <DoodleSparkle size={18} className="text-[#E6B95F]/80 hidden sm:inline-block" />
        </div>

        {/* Back to Home Link */}
        <div className="p-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl border border-[#A99BB9]/20 bg-[#373152]/60 px-3.5 py-2 text-xs font-medium text-[#F4D3B5] transition-all hover:bg-[#373152] hover:text-[#FFF3E4] hover:border-[#E6B95F]/40"
          >
            <span>←</span>
            <span>Back to Public Website</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A99BB9]">
            Retention Console
          </p>
          {links.map(([label, path, icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/workspace'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E6B95F] text-[#291C2E] font-semibold shadow-md translate-x-1'
                    : 'text-[#F4D3B5] hover:bg-[#373152] hover:text-[#FFF3E4]'
                }`
              }
            >
              <Icon name={icon} size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Plan status & footer badge */}
        <div className="border-t border-[#373152] p-4 bg-[#373152]/40">
          <PlanStatus />
        </div>
      </aside>

      {/* Main content pane */}
      <div className="flex min-h-screen flex-col md:pl-68">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-[#EBC69F]/60 bg-[#FFF3E4]/90 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-xl p-2 text-[#494269] hover:bg-[#F4D3B5] md:hidden"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-6 stroke-current stroke-2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#494269]/70">
                Workspace
              </span>
              <p className="text-sm font-editorial font-bold text-[#291C2E]">
                Customer Retention Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/workspace/predict"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#EBC69F]/50 border border-[#EBC69F] px-3.5 py-1.5 text-xs font-semibold text-[#291C2E] hover:bg-[#EBC69F] transition"
            >
              <span>+</span>
              <span>Quick Predict</span>
            </Link>
            <ProfileMenu />
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
