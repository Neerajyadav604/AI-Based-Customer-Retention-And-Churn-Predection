import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, loginUser, signupUser } from '../api'

const AuthContext = createContext(null)

// Keep authentication data available to all pages.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreUser() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreUser()
  }, [token])

  async function login(email, password) {
    const data = await loginUser(email, password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  async function signup(name, email, password) {
    const data = await signupUser(name, email, password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // Update the saved user after a profile change.
  function updateUser(updatedUser) {
    const nextUser = { ...user, ...updatedUser }
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Read the current authentication state.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
