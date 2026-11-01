import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LaunchLoader from './LaunchLoader'

export default function LaunchWorkspaceButton({ children = 'Launch Workspace', className = '', onClick }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleDone = useCallback(() => {
    navigate('/workspace')
  }, [navigate])

  function handleClick() {
    onClick?.()
    setLoading(true)
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={className} disabled={loading}>
        {children}
      </button>
      {loading && <LaunchLoader onDone={handleDone} />}
    </>
  )
}
