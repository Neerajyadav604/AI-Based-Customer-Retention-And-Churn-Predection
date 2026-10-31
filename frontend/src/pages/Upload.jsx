import { useState } from 'react'
import { predictBatch } from '../api'
import ResultsTable from '../components/ResultsTable'
import SummaryCards from '../components/SummaryCards'
import PageHeader from '../components/PageHeader'

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
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleFileChange(event) {
    const selectedFile = event.target.files[0]
    setFile(null)
    setSummary(null)
    setCustomers([])
    setError('')

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

  async function handleUpload() {
    if (!file) {
      setError('Choose a valid CSV file before uploading.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await predictBatch(file)
      setSummary(data.summary)
      setCustomers(data.customers || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <PageHeader title="Upload customer data" description="Upload a CSV with customer_id, order_id, order_date, quantity, and unit_price." />
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <button type="button" onClick={downloadTemplate} className="mb-4 rounded border border-blue-700 px-4 py-2 font-medium text-blue-700">
          Download template
        </button>
        <label className="grid max-w-xl gap-2 text-sm font-medium text-slate-700">
          CSV file (maximum 10 MB)
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="rounded border border-slate-300 p-2" />
        </label>
        {file && <p className="mt-3 text-sm text-green-700">Ready to upload: {file.name}</p>}
        <button type="button" onClick={handleUpload} disabled={loading || !file} className="mt-4 rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload and predict'}
        </button>
      </div>
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      {summary && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-semibold">Upload summary</h2>
          <SummaryCards summary={summary} />
          <ResultsTable customers={customers} />
        </>
      )}
    </section>
  )
}
