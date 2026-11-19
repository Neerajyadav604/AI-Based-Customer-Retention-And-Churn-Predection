import { useEffect, useState } from 'react'
import { getLatestPredictions } from '../api'
import ResultsTable from '../components/ResultsTable'
import ErrorMessage from '../components/ErrorMessage'
import Spinner from '../components/Spinner'
import { DoodleSparkle } from '../components/Doodles'

export default function Predictions() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPredictions() {
      try {
        const data = await getLatestPredictions()
        setCustomers(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadPredictions()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner label="Loading customer prediction cohort sheet..." />
      </div>
    )
  }

  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Customer Directory
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              Full Cohort
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Evaluated Accounts Sheet
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Comprehensive view of all customer records from your most recent prediction run, sortable and filterable.
          </p>
        </div>
      </div>

      <ResultsTable customers={customers} />
    </div>
  )
}
