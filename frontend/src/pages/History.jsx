import { useEffect, useState } from 'react'
import { getHistory } from '../api'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'

const pageSize = 20

// Format an API date for a local-friendly table display.
function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

// Load and paginate previous predictions.
export default function History() {
  const [history, setHistory] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getHistory()
        setHistory(Array.isArray(data) ? data : [])
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (loading) return <p className="text-slate-600">Loading history...</p>
  if (error) return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>

  const pageCount = Math.max(1, Math.ceil(history.length / pageSize))
  const visibleHistory = history.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section>
      <PageHeader title="Prediction history" description="Review your previous churn predictions." />
      {history.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">No prediction history yet</h2>
          <p className="mt-2 text-slate-600">Your completed predictions will appear here.</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={[
              { key: 'created_at', label: 'Date', render: (item) => formatDate(item.created_at) },
              { key: 'source', label: 'Source', render: (item) => item.source === 'upload' ? 'Batch upload' : 'Single prediction' },
              { key: 'summary', label: 'Summary' },
            ]}
            rows={visibleHistory}
          />
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>Page {page} of {pageCount}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Previous</button>
              <button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
