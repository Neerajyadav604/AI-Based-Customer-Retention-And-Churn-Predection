import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { downloadHistory, getHistory } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import Spinner from '../components/Spinner'

const pageSize = 10

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function sourceLabel(source) {
  return source === 'upload' ? 'Batch upload' : 'Single prediction'
}

function StatCard({ label, value, detail, colour = 'indigo' }) {
  const colours = {
    indigo: 'border-indigo-100 bg-indigo-50/30 text-indigo-700',
    blue: 'border-blue-100 bg-blue-50/30 text-blue-700',
    red: 'border-red-100 bg-red-50/30 text-red-700',
    amber: 'border-amber-100 bg-amber-50/30 text-amber-700',
    green: 'border-emerald-100 bg-emerald-50/30 text-emerald-700',
  }
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${colours[colour]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] text-slate-500">{detail}</p>
    </div>
  )
}

export default function History() {
  const [history, setHistory] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(null)
  const [downloadError, setDownloadError] = useState({})

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

  async function handleDownload(run) {
    setDownloading(run.id)
    setDownloadError({})
    try {
      const blob = await downloadHistory(run.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `churnIQ_predictions_${run.id}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setDownloadError({
        [run.id]: requestError.status === 404 ? 'Record was not found.' : 'Could not download.',
      })
    } finally {
      setDownloading(null)
    }
  }

  const filteredHistory = useMemo(() => {
    const value = query.toLowerCase().trim()
    if (!value) return history
    return history.filter((item) => `${item.source} ${item.summary} ${item.file_name}`.toLowerCase().includes(value))
  }, [history, query])
  const pageCount = Math.max(1, Math.ceil(filteredHistory.length / pageSize))
  const visibleHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize)
  const batchCount = history.filter((item) => item.source === 'upload').length
  const singleCount = history.length - batchCount

  if (loading) return <Spinner label="Loading history..." />
  if (error) return <ErrorMessage message={error} />

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
            <span className="size-1.5 rounded-full bg-slate-400" /> Workspace <span>/</span> <span className="text-slate-700">Prediction history</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Prediction history</h1>
          <p className="mt-2 max-w-xl text-sm leading-5 text-slate-500">Review your previous churn predictions, inspect cohort distributions, and export auditable inference logs.</p>
        </div>
        <Link to="/workspace/predict" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
          <span>✦</span> New prediction <span>→</span>
        </Link>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total runs" value={history.length} detail="All recorded predictions" />
        <StatCard label="Batch uploads" value={batchCount} detail="CSV prediction runs" colour="blue" />
        <StatCard label="Single predictions" value={singleCount} detail="Individual customer runs" colour="green" />
        <StatCard label="Latest run" value={history[0] ? formatDate(history[0].created_at).split(',')[0] : '—'} detail="Most recent activity" colour="amber" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[240px] flex-1 sm:max-w-sm">
            <span className="absolute left-3 top-2.5 text-slate-400">⌕</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Filter by batch run, source type, or status..." className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <span className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] text-slate-500">All sources ({filteredHistory.length} runs)</span>
        </div>
        {visibleHistory.length === 0 ? (
          <div className="p-12 text-center"><h2 className="text-lg font-semibold text-slate-900">No prediction history yet</h2><p className="mt-2 text-sm text-slate-500">Your completed predictions will appear here.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[9px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-4 py-3 font-semibold">Date & timestamp</th><th className="px-4 py-3 font-semibold">Source mode</th><th className="px-4 py-3 font-semibold">Cohort risk distribution / summary</th><th className="px-4 py-3 text-right font-semibold">Export & logs</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-4"><div className="font-mono text-[10px] text-slate-700">{formatDate(item.created_at)}</div><div className="mt-1 text-[10px] text-slate-400">◷ Recorded run</div></td>
                    <td className="px-4 py-4"><span className={`rounded-md px-2.5 py-1 text-[10px] font-medium ${item.source === 'upload' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>{sourceLabel(item.source)}</span></td>
                    <td className="px-4 py-4"><div className="max-w-md text-[11px] font-medium text-slate-700">{item.summary || 'Prediction completed'}</div></td>
                    <td className="px-4 py-4 text-right"><div className="flex items-center justify-end gap-2"><button type="button" disabled={downloading === item.id} onClick={() => handleDownload(item)} aria-label={`Download predictions for run ${formatDate(item.created_at)}`} className="inline-flex items-center gap-2 rounded-md border border-indigo-200 px-2.5 py-1.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50">{downloading === item.id ? <Spinner label="" /> : <DownloadIcon />}<span>Download Excel</span></button><span className="text-slate-400">⋮</span></div>{downloadError[item.id] && <p className="mt-1 text-[10px] text-red-600">{downloadError[item.id]}</p>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-[10px] text-slate-500">
          <span>Showing {visibleHistory.length} of {filteredHistory.length} prediction runs</span>
          <div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-200 px-2.5 py-1.5 disabled:opacity-40">‹ Previous</button><span className="rounded bg-indigo-600 px-2.5 py-1.5 text-white">{page}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)} className="rounded border border-slate-200 px-2.5 py-1.5 disabled:opacity-40">Next ›</button></div>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-500"><span className="mr-2 text-indigo-600">♙</span>Audit compliance: Prediction inputs, model outputs, and calculated retention scores are archived for your account.</div>
    </section>
  )
}

function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
}
