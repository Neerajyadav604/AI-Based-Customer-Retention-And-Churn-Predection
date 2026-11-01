import { useEffect, useState } from 'react'
import { changePassword, getMe, updateProfile, uploadProfilePhoto } from '../api'
import Card from '../components/Card'
import ChangePasswordForm from '../components/ChangePasswordForm'
import ErrorMessage from '../components/ErrorMessage'
import PageHeader from '../components/PageHeader'
import ProfileGeneralForm from '../components/ProfileGeneralForm'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

const emptyPassword = { current: '', next: '', repeat: '' }

// Return safe values for older accounts.
function profileDefaults(data) {
  return { name: '', email: '', phone: '', business_name: '', business_type: '', photo_url: '', ...data }
}

// Edit the signed-in user's profile and password.
export default function Profile() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState(profileDefaults())
  const [passwords, setPasswords] = useState(emptyPassword)
  const [loading, setLoading] = useState(true)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load the current profile.
  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(profileDefaults(await getMe()))
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Keep the uploaded photo in the form state.
  async function handlePhoto(photoPromise) {
    setPhotoLoading(true)
    setError('')
    try {
      setProfile({ ...profile, photo_url: await photoPromise })
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setPhotoLoading(false)
    }
  }

  // Save general profile information.
  async function handleSave(event) {
    event.preventDefault()
    const cleanName = profile.name.trim()
    if (cleanName.length < 2 || cleanName.length > 60) {
      setError('Name must be between 2 and 60 characters.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const data = await updateProfile({
        name: cleanName,
        phone: profile.phone || null,
        business_name: profile.business_name || null,
        business_type: profile.business_type || null,
      })
      const nextProfile = profileDefaults(data)
      setProfile(nextProfile)
      updateUser(nextProfile)
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  // Change the account password.
  async function handlePassword(event) {
    event.preventDefault()
    if (passwords.next.length < 8 || passwords.next.length > 64) {
      setError('New password must be between 8 and 64 characters.')
      return
    }
    if (passwords.next !== passwords.repeat) {
      setError('New passwords do not match.')
      return
    }
    setPasswordSaving(true)
    setError('')
    setMessage('')
    try {
      await changePassword(passwords.current, passwords.next)
      setPasswords(emptyPassword)
      setMessage('Password updated successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) return <Spinner label="Loading profile..." />
  if (error && !profile.email) return <ErrorMessage message={error} />

  return (
    <section>
      <PageHeader title="Profile" description="Manage your personal and business information." />
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      {message && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><ProfileGeneralForm profile={profile} onChange={(event) => setProfile({ ...profile, [event.target.name]: event.target.value })} onSave={handleSave} onPhoto={handlePhoto} uploadPhotoRequest={uploadProfilePhoto} saving={saving} photoLoading={photoLoading} /></Card>
        <Card><ChangePasswordForm passwords={passwords} onChange={setPasswords} onSubmit={handlePassword} saving={passwordSaving} /></Card>
      </div>
    </section>
  )
}
