import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabase'

export default function GoogleButton() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    if (!supabase) {
      setError('Google login is not configured.')
      setLoading(false)
      return
    }
    const destination = location.state?.from?.pathname || '/workspace'
    sessionStorage.setItem('google_redirect', destination)
    const { error: loginError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (loginError) {
      setError(loginError.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={handleGoogleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-lg border border-blue-400/30 bg-blue-950/30 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-blue-900/40 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50">
        <span className="text-base font-bold">G</span>
        {loading ? 'Connecting...' : 'Continue with Google'}
      </button>
      {error && <p className="mt-2 text-xs text-red-300" role="alert">{error}</p>}
    </div>
  )
}
