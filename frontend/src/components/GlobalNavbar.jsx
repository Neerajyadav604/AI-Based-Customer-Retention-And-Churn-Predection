import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileMenu from './ProfileMenu'
import LaunchWorkspaceButton from './LaunchWorkspaceButton'
import { DoodleSparkle } from './Doodles'

const publicLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Pricing', '/pricing'],
  ['Docs', '/docs'],
]

export default function GlobalNavbar({ transparent = false }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.is_admin === true

  function closeMenu() {
    setOpen(false)
  }

  return (
    <header
      className={`relative z-50 transition-colors ${
        transparent
          ? 'absolute inset-x-0 top-0 border-b border-[#EBC69F]/20 bg-[#291C2E]/60 backdrop-blur-md text-[#FFF3E4]'
          : 'border-b border-[#EBC69F]/70 bg-[#FFF3E4]/95 backdrop-blur-md text-[#291C2E] sticky top-0 shadow-[0_2px_12px_-4px_rgba(41,28,46,0.06)]'
      }`}
    >
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center gap-2.5 text-xl font-editorial font-bold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#291C2E] text-[#E6B95F] shadow-sm transition-transform group-hover:rotate-6">
            <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-current stroke-2">
              <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <span className={transparent ? 'text-[#FFF3E4]' : 'text-[#291C2E]'}>
            Churn<span className="text-[#E6B95F]">Guard</span>
          </span>
          <span className="rounded-full bg-[#E6B95F]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E6B95F] border border-[#E6B95F]/40">
            AI
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`rounded-xl p-2.5 transition md:hidden ${
            transparent
              ? 'text-[#FFF3E4] hover:bg-white/10'
              : 'text-[#494269] hover:bg-[#F4D3B5]'
          }`}
          aria-label="Toggle navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-6 stroke-current stroke-2">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Nav Links */}
        <nav
          className={`${
            open ? 'flex' : 'hidden'
          } absolute left-0 right-0 top-full flex-col gap-1 border-b p-5 md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 ${
            transparent
              ? 'border-[#EBC69F]/20 bg-[#373152] text-[#FFF3E4]'
              : 'border-[#EBC69F] bg-[#FFF3E4] text-[#291C2E]'
          }`}
        >
          {publicLinks.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? transparent
                      ? 'bg-[#E6B95F] text-[#291C2E] font-semibold shadow-sm'
                      : 'bg-[#291C2E] text-[#FFF3E4] font-semibold shadow-sm'
                    : transparent
                    ? 'text-[#F4D3B5] hover:bg-white/10 hover:text-[#FFF3E4]'
                    : 'text-[#392D35] hover:bg-[#F4D3B5] hover:text-[#291C2E]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/workspace/admin"
              onClick={closeMenu}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                transparent
                  ? 'text-[#F4D3B5] hover:bg-white/10'
                  : 'text-[#392D35] hover:bg-[#F4D3B5]'
              }`}
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right CTA / Auth status */}
        <div
          className={`${
            open ? 'flex' : 'hidden'
          } absolute right-4 top-full flex-col gap-2.5 border-b p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
        >
          {user ? (
            <div className="flex items-center gap-3">
              <LaunchWorkspaceButton
                onClick={closeMenu}
                className="rounded-xl bg-[#E6B95F] px-4 py-2 text-sm font-semibold text-[#291C2E] shadow-sm hover:bg-[#D6A34E] hover:-translate-y-0.5 transition"
              >
                Launch Workspace
              </LaunchWorkspaceButton>
              <ProfileMenu />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                onClick={closeMenu}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  transparent
                    ? 'text-[#F4D3B5] hover:text-[#FFF3E4] hover:bg-white/10'
                    : 'text-[#494269] hover:bg-[#F4D3B5]'
                }`}
              >
                Sign In
              </Link>
              <LaunchWorkspaceButton
                onClick={closeMenu}
                className="rounded-xl bg-[#E6B95F] px-4 py-2 text-sm font-bold text-[#291C2E] shadow-sm hover:bg-[#D6A34E] hover:-translate-y-0.5 transition"
              >
                Get Started
              </LaunchWorkspaceButton>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
