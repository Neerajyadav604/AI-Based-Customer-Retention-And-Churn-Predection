import { useEffect, useState } from 'react'
import { changePassword, getMe, updateProfile } from '../api'
import Card from '../components/Card'
import ChangePasswordForm from '../components/ChangePasswordForm'
import ErrorMessage from '../components/ErrorMessage'
import ProfileGeneralForm from '../components/ProfileGeneralForm'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { DoodleSparkle, DoodleAvatar } from '../components/Doodles'

const emptyPassword = { current: '', next: '', repeat: '' }

function profileDefaults(data) {
  return { name: '', email: '', phone: '', business_name: '', business_type: '', photo_url: '', ...data }
}

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

  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(profileDefaults(await getMe()))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handlePhoto(photoPromise) {
    setPhotoLoading(true)
    setError('')
    try {
      setProfile({ ...profile, photo_url: await photoPromise })
    } catch (err) {
      setError(err.message)
    } finally {
      setPhotoLoading(false)
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await updateProfile(profile)
      setProfile(profileDefaults(updated))
      updateUser?.(updated)
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePassword(e) {
    e.preventDefault()
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
      setMessage('Password changed successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner label="Loading user profile settings..." />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Account Preferences
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              Settings
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              User Profile & Security
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Manage your personal contact details, workspace organization identity, and account credentials.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {message && (
        <div className="rounded-2xl border border-[#7EAA79] bg-[#EAF5E9] p-4 text-xs font-semibold text-[#2D5A27]">
          ✓ {message}
        </div>
      )}

      {/* Profile Form */}
      <Card className="rounded-3xl border-[#EBC69F]">
        <h2 className="font-editorial text-2xl font-bold text-[#291C2E] mb-1">
          General Details
        </h2>
        <p className="text-xs text-[#392D35] mb-6">
          Your personal and business profile details across ChurnGuard workspaces.
        </p>

        <ProfileGeneralForm
          profile={profile}
          onChange={(field, value) => setProfile({ ...profile, [field]: value })}
          onSubmit={handleSaveProfile}
          onPhotoChange={handlePhoto}
          saving={saving}
          photoLoading={photoLoading}
        />
      </Card>

      {/* Password Reset Form */}
      <Card className="rounded-3xl border-[#EBC69F]">
        <h2 className="font-editorial text-2xl font-bold text-[#291C2E] mb-1">
          Security & Password
        </h2>
        <p className="text-xs text-[#392D35] mb-6">
          Update the password used to authenticate into your account.
        </p>

        <ChangePasswordForm
          passwords={passwords}
          onChange={(field, value) => setPasswords({ ...passwords, [field]: value })}
          onSubmit={handleSavePassword}
          saving={passwordSaving}
        />
      </Card>
    </div>
  )
}
