import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getHistory, predictBatch } from '../api'
import { usePlan } from '../context/PlanContext'
import ErrorMessage from '../components/ErrorMessage'
import TrialBanner from '../components/TrialBanner'
import UpgradePrompt from '../components/UpgradePrompt'
import ResultsTable from '../components/ResultsTable'
import SummaryCards from '../components/SummaryCards'
import PageHeader from '../components/PageHeader'
import ProbabilityHistogram from '../components/ProbabilityHistogram'
import Spinner from '../components/Spinner'
import Icon from '../components/Icon'

const requiredColumns = ['customer_id', 'order_id', 'order_date', 'quantity', 'unit_price']
const maxFileSize = 10 * 1024 * 1024

// Create and download a valid sample CSV.
function downloadTemplate() {
  const csv = [
    requiredColumns.join(','),
    'customer-001,order-001,2026-10-01,2,250',
    'customer-001,order-002,2026-10-15,1,120',
  ].join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  link.download = 'churn-upload-template.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

// Validate the selected CSV and upload it for predictions.
export default function Upload() {
  const location = useLocation()
  const { refreshPlan } = usePlan()
  const fileInput = useRef(null)
  const [limitMessage, setLimitMessage] = useState('')
  const [file, setFile] = useState(null)
  const [history, setHistory] = useState([])
  const [dragging, setDragging] = useState(false)
  const [summary, setSummary] = useState(null)
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoData, setDemoData] = useState(Boolean(location.state?.demoData))

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getHistory()
        setHistory(Array.isArray(data) ? data.filter((item) => item.source === 'upload').slice(0, 5) : [])
      } catch {
        setHistory([])
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    if (!location.state?.demoData) return
    async function loadDemoFile() {
      const response = await fetch('/data/sample_orders.csv')
      if (!response.ok) {
        setError('The demonstration dataset could not be loaded.')
        return
      }
      const blob = await response.blob()
      setFile(new File([blob], 'sample_orders.csv', { type: 'text/csv' }))
    }
    loadDemoFile()
  }, [location.state])

  async function selectFile(selectedFile) {
    setFile(null)
    setSummary(null)
    setCustomers([])
    setError('')
    setLimitMessage('')

    if (!selectedFile) return
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a CSV file.')
      return
    }
    if (selectedFile.size > maxFileSize) {
      setError('The CSV file must be 10 MB or smaller.')
      return
    }

    const firstLine = (await selectedFile.text()).split(/\r?\n/)[0]
    const columns = firstLine.split(',').map((column) => column.trim())
    const missingColumns = requiredColumns.filter((column) => !columns.includes(column))
    if (missingColumns.length > 0) {
      setError(`Missing required columns: ${missingColumns.join(', ')}`)
      return
    }
    setFile(selectedFile)
  }

  async function handleFileChange(event) {
    await selectFile(event.target.files[0])
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    selectFile(event.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!file) {
      setError('Choose a valid CSV file before uploading.')
      return
    }
    setLoading(true)
    setError('')
    setLimitMessage('')
    try {
      const data = await predictBatch(file)
      setSummary(data.summary)
      setCustomers(data.customers || [])
      refreshPlan()
    } catch (requestError) {
      if (requestError.status === 403) {
        setLimitMessage(requestError.message)
      } else {
        setError(requestError.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <PageHeader
        title="Upload Customer Telemetry"
        description="Upload your order telemetry CSV file to trigger automated feature extraction, churn propensity scoring, and cohort analysis."
        action={(
          <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600">
            <DownloadIcon />
            Download Sample CSV
          </button>
        )}
      />
      {demoData && <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"><span>You are using demonstration data.</span><button type="button" onClick={() => setDemoData(false)} aria-label="Dismiss demonstration data notice">Dismiss</button></div>}
      <TrialBanner />
      {limitMessage && <UpgradePrompt message={limitMessage} onClose={() => setLimitMessage('')} />}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Dataset Ingestion</h2>
            <p className="mt-1 text-xs text-slate-400">Accepts structured .csv files with standard customer header format</p>
          </div>
          <span className="hidden rounded-md bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-500 sm:block">Max 150k rows · 10MB</span>
        </div>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-[218px] w-full flex-col items-center justify-center rounded-xl border border-dashed px-5 text-center transition focus-visible:ring-2 focus-visible:ring-indigo-600 ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50/40 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
        >
          <span className="mb-4 grid size-12 place-items-center rounded-xl border border-indigo-100 bg-white text-indigo-500 shadow-sm"><Icon name="upload" size={23} /></span>
          <span className="text-sm font-semibold text-slate-700">{file ? file.name : 'Drag & drop your CSV here, or browse'}</span>
          <span className="mt-2 text-xs text-slate-400">UTF-8 encoded comma separated values with column headers</span>
        </button>
        <input ref={fileInput} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="sr-only" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <span className="inline-flex items-center gap-2 text-xs text-slate-400"><span className="text-indigo-500">◉</span>AES-256 encrypted · Automated validation</span>
          <button type="button" onClick={handleUpload} disabled={loading || !file} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
            <Icon name="insights" size={15} />
            {loading ? <Spinner label="Uploading..." /> : 'Upload and predict'}
          </button>
        </div>
      </div>
      {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700"><Icon name="insights" size={15} className="text-indigo-500" />Expected schema columns</h2>
          <span className="text-xs text-slate-400">5 columns required</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {requiredColumns.map((column, index) => <span key={column} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-1.5 font-mono text-[10px] text-slate-500">{column} <span className="font-sans text-slate-400">{['(uuid)', '(string)', '(YYYY-MM-DD)', '(int > 0)', '(float)'][index]}</span></span>)}
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon name="history" size={15} className="text-indigo-500" />Recent Batches</h2>
          <span className="font-mono text-[10px] text-indigo-600">All pipeline logs →</span>
        </div>
        {history.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No completed batch uploads yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">File</th><th className="pb-3 font-medium">Summary</th><th className="pb-3 text-right font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-50">{history.map((item) => <tr key={item.id}><td className="py-3 font-mono text-slate-600">{formatDate(item.created_at)}</td><td className="py-3 text-slate-600">{item.file_name || 'CSV upload'}</td><td className="py-3 text-slate-500">{item.summary || 'Prediction completed'}</td><td className="py-3 text-right"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">Complete</span></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      {summary && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-semibold">Upload summary</h2>
          <SummaryCards summary={summary} />
          <ProbabilityHistogram customers={customers} />
          <ResultsTable customers={customers} />
        </>
      )}
    </section>
  )
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
}
