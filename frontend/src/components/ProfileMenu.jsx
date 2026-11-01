import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserAvatar from './UserAvatar'
import Icon from './Icon'

// Shared account menu for the public navbar and workspace top bar.
export default function ProfileMenu({ compact = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function closeOnOutside(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  if (!user) return null

  return (
    <div ref={menuRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full p-1 text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600" aria-expanded={open} aria-haspopup="menu" aria-label="Open profile menu">
        <UserAvatar user={user} size={compact ? 'size-9' : 'size-8'} />
        {!compact && <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">{user.name}</span>}
        {!compact && <Icon name="chevron" size={15} className="hidden text-slate-400 sm:block" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right animate-[profile-menu-in_120ms_ease-out] rounded-xl border border-slate-200 bg-white p-2 shadow-xl" role="menu">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Link to="/workspace/profile" onClick={() => setOpen(false)} className="mt-1 block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">Profile</Link>
          <button type="button" onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" role="menuitem">Logout</button>
        </div>
      )}
    </div>
  )
}
