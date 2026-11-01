import { useState } from 'react'
import { Link } from 'react-router-dom'
import { upgrade } from '../lib/upgrade'

// Friendly 403 message when trials are finished or the upload is too large.
export default function UpgradePrompt({ message, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      await upgrade('pro')
      onClose?.()
    } catch (requestError) {
      if (requestError.message !== 'Payment cancelled') {
        setError(requestError.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900">Upgrade to continue</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/pricing" className="inline-flex min-h-10 items-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-900 hover:bg-slate-50">
            View plans
          </Link>
          <button type="button" disabled={loading} onClick={handleUpgrade} className="inline-flex min-h-10 items-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Opening checkout...' : 'Upgrade now'}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
