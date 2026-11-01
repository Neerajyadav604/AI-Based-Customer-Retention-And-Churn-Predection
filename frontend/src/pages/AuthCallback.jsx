import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'

export default function AuthCallback() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    async function finishGoogleLogin() {
      sessionStorage.removeItem('google_redirect')
      try {
        if (!supabase) throw new Error('Google login is not configured.')
        const { data } = await supabase.auth.getSession()
        if (!data.session?.access_token) {
          throw new Error('Google login did not return a session.')
        }
        const user = await loginWithGoogle(data.session.access_token)
        await supabase.auth.signOut()
        navigate(user.onboarding_completed === false ? '/onboarding' : '/', { replace: true })
      } catch (error) {
        if (supabase) await supabase.auth.signOut()
        navigate('/login', { replace: true, state: { error: error.message || 'Google login failed.' } })
      }
    }

    finishGoogleLogin()
  }, [loginWithGoogle, navigate])

  return <div className="flex min-h-screen items-center justify-center bg-[#071426] text-white"><Spinner label="Signing you in..." /></div>
}
