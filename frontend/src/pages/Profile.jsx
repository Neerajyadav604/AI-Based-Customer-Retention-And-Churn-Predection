import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword, getMe, updateProfile } from '../api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'

// Show and update the signed-in user's account details.
export default function Profile() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMe()
        setProfile(data)
        setName(data.name || '')
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  async function handleNameSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }

    setSavingName(true)
    setError('')
    setMessage('')
    try {
      const updatedProfile = await updateProfile(name.trim())
      setProfile({ ...profile, ...updatedProfile, name: updatedProfile.name || name.trim() })
      setMessage('Name updated successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingName(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (passwords.newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (passwords.newPassword !== passwords.confirm) {
      setError('New passwords do not match.')
      return
    }

    setSavingPassword(true)
    setError('')
    setMessage('')
    try {
      await changePassword(passwords.current, passwords.newPassword)
      setPasswords({ current: '', newPassword: '', confirm: '' })
      setMessage('Password changed successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingPassword(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  if (loading) return <p className="text-slate-600">Loading profile...</p>
  if (error && !profile) return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>

  return (
    <section className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Manage your account details and password." />
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded bg-green-50 p-3 text-green-700">{message}</p>}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Account details</h2>
        <p className="mt-3 text-slate-700"><strong>Name:</strong> {profile.name}</p>
        <p className="mt-1 text-slate-700"><strong>Email:</strong> {profile.email}</p>
      </div>
      <form onSubmit={handleNameSubmit} className="mb-6 grid gap-4 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Edit name</h2>
        <label className="grid gap-1 text-sm font-medium">Name
          <input required value={name} onChange={(event) => setName(event.target.value)} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <button type="submit" disabled={savingName} className="w-fit rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50">
          {savingName ? 'Saving...' : 'Save name'}
        </button>
      </form>
      <form onSubmit={handlePasswordSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Change password</h2>
        <label className="grid gap-1 text-sm font-medium">Current password
          <input required type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">New password
          <input required minLength="8" type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Confirm new password
          <input required minLength="8" type="password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <button type="submit" disabled={savingPassword} className="w-fit rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50">
          {savingPassword ? 'Changing...' : 'Change password'}
        </button>
      </form>
      <button type="button" onClick={handleLogout} className="mt-6 rounded border border-red-600 px-4 py-2 font-medium text-red-600">
        Logout
      </button>
    </section>
  )
}
