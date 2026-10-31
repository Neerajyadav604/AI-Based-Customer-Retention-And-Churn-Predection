import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword, getMe, updateProfile } from '../api'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

// Show and update the signed-in user's account details.
export default function Profile() {
  const { logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Load the latest profile from the backend.
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

  // Save the user's new name.
  async function handleNameSubmit(event) {
    event.preventDefault()
    const cleanName = name.trim()
    if (cleanName.length < 2 || cleanName.length > 60) {
      setError('Name must be between 2 and 60 characters.')
      return
    }
    setSavingName(true)
    setError('')
    setMessage('')
    try {
      const updatedProfile = await updateProfile(cleanName)
      setProfile({ ...profile, ...updatedProfile })
      updateUser(updatedProfile)
      setMessage('Name updated successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingName(false)
    }
  }

  // Save the user's new password.
  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (passwords.newPassword.length < 8 || passwords.newPassword.length > 64) {
      setError('New password must be between 8 and 64 characters.')
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

  // Clear the session and leave the profile page.
  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  if (loading) return <Spinner label="Loading profile..." />
  if (error && !profile) return <ErrorMessage message={error} />

  return (
    <section className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Manage your account details and password." />
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      {message && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{message}</p>}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold">Account details</h2>
        <p className="mt-3 text-slate-700"><strong>Name:</strong> {profile.name}</p>
        <p className="mt-1 text-slate-700"><strong>Email:</strong> {profile.email}</p>
      </Card>
      <form onSubmit={handleNameSubmit} className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Edit name</h2>
        <label className="grid gap-1 text-sm font-medium">Name
          <input required value={name} onChange={(event) => setName(event.target.value)} className="rounded border border-slate-300 px-3 py-2 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" />
        </label>
        <button type="submit" disabled={savingName} className="w-fit rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50">
          {savingName ? <Spinner label="Saving..." /> : 'Save name'}
        </button>
      </form>
      <form onSubmit={handlePasswordSubmit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Change password</h2>
        <label className="grid gap-1 text-sm font-medium">Current password
          <input required type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} className="rounded border border-slate-300 px-3 py-2 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" />
        </label>
        <label className="grid gap-1 text-sm font-medium">New password
          <input required type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className="rounded border border-slate-300 px-3 py-2 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Confirm new password
          <input required type="password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} className="rounded border border-slate-300 px-3 py-2 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" />
        </label>
        <button type="submit" disabled={savingPassword} className="w-fit rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50">
          {savingPassword ? <Spinner label="Changing..." /> : 'Change password'}
        </button>
      </form>
      <button type="button" onClick={handleLogout} className="mt-6 rounded border border-red-600 px-4 py-2 font-medium text-red-600">Logout</button>
    </section>
  )
}
