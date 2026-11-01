import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PlanStatus from './PlanStatus'
import Spinner from './Spinner'
import ProfileMenu from './ProfileMenu'
import Icon from './Icon'

const links = [
  ['Overview', '/workspace', 'overview'],
  ['Predict', '/workspace/predict', 'predict'],
  ['Bulk Predictions', '/workspace/upload', 'upload'],
  ['Model Insights', '/workspace/insights', 'insights'],
  ['History', '/workspace/history', 'history'],
  ['Recommendations', '/workspace/recommendations', 'recommendations'],
  ['Profile & Settings', '/workspace/profile', 'profile'],
]

// Provide the protected workspace sidebar, top bar, and page outlet.
export default function WorkspaceLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [preparing, setPreparing] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const timer = window.setTimeout(() => setPreparing(false), 1000)
    return () => window.clearTimeout(timer)
  }, [])

  if (preparing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-indigo-600">
        <Spinner label="Preparing your workspace..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`${menuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#1e2b47] text-white transition-transform md:translate-x-0`}>
        <div className="flex h-20 items-center gap-2 px-6">
          <Link to="/" className="text-xl font-bold tracking-tight">ChurnGuard</Link>
          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-200">AI</span>
        </div>
        <Link to="/" onClick={() => setMenuOpen(false)} className="mx-3 mb-5 flex items-center rounded-lg border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
          ← Back to home
        </Link>
        <nav className="flex-1 overflow-y-auto px-3">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <div className="space-y-1">
            {links.map(([label, path, icon]) => (
            <NavLink key={path} to={path} end={path === '/workspace'} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-[#2563eb] text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <Icon name={icon} size={17} />
              <span>{label}</span>
            </NavLink>
            ))}
          </div>
        </nav>
        <div className="border-t border-white/10 p-4">
          <PlanStatus />
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">{user?.business_name || 'My workspace'}</span>
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex"><span className="size-1.5 rounded-full bg-emerald-500" />Logistic Regression</span>
          </div>
          <ProfileMenu />
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8 lg:px-10"><Outlet /></main>
      </div>
    </div>
  )
}
