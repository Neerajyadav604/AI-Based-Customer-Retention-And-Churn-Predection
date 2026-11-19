import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getHistory, predictBatch } from '../api'
import { usePlan } from '../context/PlanContext'
import ErrorMessage from '../components/ErrorMessage'
import TrialBanner from '../components/TrialBanner'
import UpgradePrompt from '../components/UpgradePrompt'
import ResultsTable from '../components/ResultsTable'
import SummaryCards from '../components/SummaryCards'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import { DoodleSparkle } from '../components/Doodles'

const requiredColumns = ['customer_id', 'order_id', 'order_date', 'quantity', 'unit_price']
const maxFileSize = 100 * 1024 * 1024

function downloadTemplate() {
  const csv = [
    requiredColumns.join(','),
    'customer-001,order-001,2026-10-01,2,250',
    'customer-001,order-002,2026-10-15,1,120',
    'customer-002,order-003,2026-09-20,4,85',
  ].join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  link.download = 'churnguard-order-template.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

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

  function handleFileSelect(selectedFile) {
    if (!selectedFile) return
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid .csv spreadsheet file.')
      return
    }
    if (selectedFile.size > maxFileSize) {
      setError('File exceeds 100MB limit.')
      return
    }
    setFile(selectedFile)
    setError('')
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const data = await predictBatch(file)
      setSummary(data.summary || data)
      setCustomers(data.customers || [])
      refreshPlan?.()
    } catch (err) {
      if (err.status === 403) {
        setLimitMessage(err.message || 'Trial limits exceeded. Please upgrade.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Bulk Inference
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              Multi-Customer
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Batch Order Processing
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Upload raw sales transaction logs to calculate RFM features and evaluate cohort-wide churn risk.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          className="rounded-2xl border-1.5 border-[#EBC69F] bg-[#FFF8ED] px-4 py-2 text-xs font-semibold text-[#494269] hover:bg-[#EBC69F] transition btn-interactive"
        >
          📥 Download Sample CSV
        </button>
      </div>

      <TrialBanner />
      {limitMessage && <UpgradePrompt message={limitMessage} onClose={() => setLimitMessage('')} />}
      {error && <ErrorMessage message={error} />}

      {/* Upload Drop Zone Card */}
      <Card className="rounded-3xl border-2 border-dashed border-[#EBC69F] bg-white p-8 sm:p-12 text-center">
        <input
          ref={fileInput}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFileSelect(e.dataTransfer.files[0])
          }}
          className={`rounded-2xl p-6 transition ${
            dragging ? 'bg-[#FFF8ED] border-2 border-[#494269]' : ''
          }`}
        >
          <div className="size-16 rounded-2xl bg-[#FFF8ED] text-[#494269] mx-auto flex items-center justify-center mb-4 shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" className="size-8 stroke-current stroke-2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>

          <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
            {file ? file.name : 'Choose an orders CSV or drag & drop'}
          </h3>
          <p className="mt-2 text-xs text-[#392D35] max-w-sm mx-auto leading-relaxed">
            CSV must include columns: <code className="font-mono text-[#494269]">customer_id, order_id, order_date, quantity, unit_price</code>
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="rounded-xl border border-[#494269] bg-[#FFF8ED] px-5 py-2 text-xs font-semibold text-[#494269] hover:bg-[#EBC69F]/50 transition"
            >
              Browse Files
            </button>

            {file && (
              <button
                type="button"
                disabled={loading}
                onClick={handleUpload}
                className="rounded-xl bg-[#494269] px-6 py-2 text-xs font-semibold text-[#FFF3E4] shadow-sm hover:bg-[#373152] transition disabled:opacity-50 btn-interactive"
              >
                {loading ? 'Processing ML Pipeline...' : 'Run Batch Prediction →'}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Batch Results View */}
      {customers.length > 0 && (
        <div className="space-y-6">
          <SummaryCards summary={summary} />
          <ResultsTable customers={customers} />
        </div>
      )}
    </div>
  )
}
