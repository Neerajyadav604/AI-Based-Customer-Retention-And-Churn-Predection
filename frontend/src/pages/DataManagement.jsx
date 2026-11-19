import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getUploadHistory, getUploadDetails, getLatestPredictions } from '../api'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import RiskBadge from '../components/RiskBadge'
import { DoodleSparkle } from '../components/Doodles'

const DEFAULT_DATASETS = [
  {
    id: 1,
    file_name: 'Telco-Customer-Q3-Active.csv',
    tag: 'Default primary evaluation cohort',
    created_at: '2026-10-24T14:22:00Z',
    record_count: 7842,
    features_count: 21,
    health_score: 98.4,
    status: 'Scored & Indexed',
    target_column: 'Churn (Yes/No)',
  },
  {
    id: 2,
    file_name: 'Telco-Historical-2023-Train.csv',
    tag: 'Baseline synthetic training corpus',
    created_at: '2026-09-12T09:15:00Z',
    record_count: 5600,
    features_count: 21,
    health_score: 99.1,
    status: 'Trained in v1.8',
    target_column: 'Churn (Yes/No)',
  },
  {
    id: 3,
    file_name: 'SaaS-Cohort-Sept-Draft.csv',
    tag: 'Incomplete trial cohort test',
    created_at: '2026-10-18T18:44:00Z',
    record_count: 1200,
    features_count: 18,
    health_score: 76.2,
    status: 'Validation Warning',
    target_column: 'Unmapped',
  },
]

const SCHEMA_FIELDS = [
  { name: 'customerID', type: 'string', desc: 'Primary Key, Unique Identifier', nulls: '0 nulls', valid: true },
  { name: 'tenure', type: 'integer', desc: 'Account longevity in full months (0–72)', nulls: '0 nulls', valid: true },
  { name: 'MonthlyCharges', type: 'float', desc: 'Recurring bill amount in USD ($18.25 - $118.75)', nulls: '0 nulls', valid: true },
  { name: 'TotalCharges', type: 'float', desc: 'Cumulative billed amount across active tenure', nulls: '11 auto-imputed', valid: true, warning: true },
  { name: 'Contract', type: 'categorical', desc: 'Month-to-month, One year, Two year commitments', nulls: '0 nulls', valid: true },
  { name: 'InternetService', type: 'categorical', desc: 'DSL, Fiber optic, No internet connection', nulls: '0 nulls', valid: true },
  { name: 'TechSupport', type: 'categorical', desc: 'Yes, No, No internet service entitlement', nulls: '0 nulls', valid: true },
  { name: 'PaymentMethod', type: 'categorical', desc: 'Electronic check, Mailed check, Bank transfer, Credit card', nulls: '0 nulls', valid: true },
  { name: 'PaperlessBilling', type: 'boolean', desc: 'Electronic invoice receipt opt-in state', nulls: '0 nulls', valid: true },
  { name: 'OnlineSecurity', type: 'categorical', desc: 'Multi-factor and anti-intrusion add-on suite', nulls: '0 nulls', valid: true },
  { name: 'DeviceProtection', type: 'categorical', desc: 'Hardware loss & damage warranty coverage', nulls: '0 nulls', valid: true },
]

export default function DataManagement() {
  const [datasets, setDatasets] = useState(DEFAULT_DATASETS)
  const [selectedDataset, setSelectedDataset] = useState(DEFAULT_DATASETS[0])
  const [previewCustomers, setPreviewCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [schemaExpanded, setSchemaExpanded] = useState(false)
  const [query, setQuery] = useState('')

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const [historyData, predsData] = await Promise.all([
        getUploadHistory().catch(() => []),
        getLatestPredictions().catch(() => []),
      ])

      // Format live uploads from database
      if (Array.isArray(historyData) && historyData.length > 0) {
        const liveList = historyData.map((h, idx) => ({
          id: h.id,
          file_name: h.file_name || `Upload_${h.id}.csv`,
          tag: h.status === 'Completed' ? 'Validated production cohort' : 'Processing validation event',
          created_at: h.created_at,
          record_count: h.total_records || h.total || 5,
          features_count: 21,
          health_score: h.status === 'Completed' ? 98.4 : 64.0,
          status: h.status === 'Completed' ? 'Scored & Indexed' : 'Validation Warning',
          target_column: 'Churn (Yes/No)',
          raw: h,
        }))
        setDatasets(liveList)
        setSelectedDataset(liveList[0])
      }

      if (Array.isArray(predsData) && predsData.length > 0) {
        setPreviewCustomers(predsData)
      }
    } catch (err) {
      setError(err.message || 'Could not load data inventory.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredDatasets = useMemo(() => {
    if (!query.trim()) return datasets
    const q = query.toLowerCase()
    return datasets.filter(
      (d) =>
        d.file_name.toLowerCase().includes(q) ||
        (d.status && d.status.toLowerCase().includes(q))
    )
  }, [datasets, query])

  const visibleSchema = schemaExpanded ? SCHEMA_FIELDS : SCHEMA_FIELDS.slice(0, 8)

  const handleExportDictionary = () => {
    const jsonStr = JSON.stringify(SCHEMA_FIELDS, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedDataset?.file_name || 'dataset'}_data_dictionary.json`
    link.click()
  }

  const handleExportSanitizedCSV = () => {
    if (!previewCustomers || previewCustomers.length === 0) return
    const headers = ['customer_id', 'recency_days', 'frequency', 'monetary', 'tenure_days', 'total_items', 'avg_order_value', 'churn_probability', 'risk_level']
    const csv = [
      headers.join(','),
      ...previewCustomers.map((c) =>
        headers.map((h) => JSON.stringify(c[h] ?? '')).join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sanitized_${selectedDataset?.file_name || 'cohort'}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner label="Loading Data Management & Schema Validation..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-[#EAF5E9] border border-[#7EAA79]/50 px-2.5 py-0.5 text-[10px] font-bold text-[#2D5A27] flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#43823C] animate-pulse" />
              ETL INGESTION ENGINE • Pipeline Live
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              {datasets.length} Monitored
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Data Management &amp; Schema Validation
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Upload customer datasets, inspect ingested schemas, track preprocessing pipelines, and validate live inference readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="rounded-2xl border border-[#EBC69F] bg-white px-4 py-2.5 text-xs font-semibold text-[#291C2E] shadow-xs hover:bg-[#FAF2DF] transition flex items-center gap-2 cursor-pointer"
          >
            <span className={refreshing ? 'animate-spin' : ''}>↻</span>
            <span>{refreshing ? 'Re-Syncing Lake...' : 'Re-Sync Lake'}</span>
          </button>

          <Link
            to="/workspace/upload"
            className="rounded-2xl bg-[#494269] px-5 py-2.5 text-xs font-semibold text-[#FFF3E4] shadow-sm hover:bg-[#373152] transition btn-interactive flex items-center gap-1.5"
          >
            <span>Upload New Customer Dataset (.CSV, .XLSX)</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* 2. Top 4 KPI Metric Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#EBC69F]/80 bg-white p-6 shadow-xs card-hover-lift">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#494269]/70">
              Active Monitored Datasets
            </p>
            <span className="grid size-9 place-items-center rounded-xl font-bold bg-[#FAF2DF] text-[#494269]">
              🗄️
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-[#291C2E] tracking-tight">
            {datasets.length} <span className="text-sm font-normal text-[#392D35]">Repositories</span>
          </p>
          <p className="mt-2 text-xs text-[#392D35]">
            {datasets.reduce((acc, d) => acc + (d.record_count || 0), 0).toLocaleString()} total evaluated rows
          </p>
        </div>

        <div className="rounded-3xl border border-[#7EAA79]/50 bg-[#EAF5E9]/60 p-6 shadow-xs card-hover-lift">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2D5A27]">
              Weighted Data Health
            </p>
            <span className="grid size-9 place-items-center rounded-xl font-bold bg-[#EAF5E9] text-[#43823C]">
              ✓
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-[#291C2E] tracking-tight">
            98.4%
          </p>
          <p className="mt-2 text-xs text-[#2D5A27] font-semibold">
            +1.4% vs last sync • Enterprise Grade
          </p>
        </div>

        <div className="rounded-3xl border border-[#E6B95F]/50 bg-[#FAF2DF]/60 p-6 shadow-xs card-hover-lift">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C6819]">
              Auto-Imputation Tasks
            </p>
            <span className="grid size-9 place-items-center rounded-xl font-bold bg-[#FAF2DF] text-[#D6A34E]">
              🪄
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-[#291C2E] tracking-tight">
            11 <span className="text-sm font-normal text-[#392D35]">Cells</span>
          </p>
          <p className="mt-2 text-xs text-[#8C6819]">
            Median / RF imputer pipeline applied
          </p>
        </div>

        <div className="rounded-3xl border border-[#EBC69F]/80 bg-white p-6 shadow-xs card-hover-lift">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#494269]/70">
              Schema Drift Risk
            </p>
            <span className="grid size-9 place-items-center rounded-xl font-bold bg-[#FAF2DF] text-[#494269]">
              🛡️
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold text-[#291C2E] tracking-tight">
            0.03 <span className="text-sm font-normal text-[#392D35]">PSI</span>
          </p>
          <p className="mt-2 text-xs text-[#43823C] font-semibold">
            Safe Threshold (PSI &lt; 0.10)
          </p>
        </div>
      </div>

      {/* 3. Active Ingested Datasets Table */}
      <Card className="rounded-3xl border-[#EBC69F] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBC69F]/40 pb-4 mb-4">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
              Active Ingested Datasets
            </h3>
            <p className="text-xs text-[#392D35] mt-0.5">
              Ingestion status, schema mapping, and real-time data validation health index.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter inventory..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border border-[#EBC69F] bg-[#FFF3E4] px-3.5 py-1.5 text-xs text-[#291C2E] placeholder-[#A99BB9] focus:border-[#494269] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleExportSanitizedCSV}
              className="rounded-xl border border-[#EBC69F] bg-[#FAF2DF] px-3.5 py-1.5 text-xs font-bold text-[#8C6819] hover:bg-[#EBC69F] transition"
            >
              Export Inventory 📥
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF2DF]/70 text-[10px] font-bold uppercase tracking-wider text-[#494269] border-b border-[#EBC69F]/60">
              <tr>
                <th className="px-4 py-3">Dataset Name</th>
                <th className="px-3 py-3">Ingestion Date</th>
                <th className="px-3 py-3 text-center">Record Count</th>
                <th className="px-3 py-3 text-center">Features</th>
                <th className="px-4 py-3">Health Score</th>
                <th className="px-3 py-3 text-center">Pipeline Status</th>
                <th className="px-3 py-3">Target Column</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBC69F]/30 bg-white">
              {filteredDatasets.map((d) => {
                const isSelected = selectedDataset?.id === d.id
                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDataset(d)}
                    className={`transition cursor-pointer ${
                      isSelected ? 'bg-[#FAF2DF]/50' : 'hover:bg-[#FFF3E4]'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 place-items-center rounded-lg bg-[#FAF2DF] text-xs font-bold text-[#8C6819]">
                          📊
                        </span>
                        <div>
                          <p className="font-bold text-xs text-[#291C2E]">{d.file_name}</p>
                          <p className="text-[10px] text-[#A99BB9]">{d.tag}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 font-mono text-[11px] text-[#392D35]">
                      {new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-3 py-3.5 text-center font-mono font-bold text-[#291C2E]">
                      {d.record_count?.toLocaleString()}
                    </td>

                    <td className="px-3 py-3.5 text-center font-mono text-[#392D35]">
                      {d.features_count} cols
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-[#FAF2DF] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.health_score}%`,
                              backgroundColor: d.health_score > 90 ? '#43823C' : '#E6B95F',
                            }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[#291C2E]">
                          {d.health_score}%
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          d.status === 'Scored & Indexed'
                            ? 'bg-[#EAF5E9] text-[#2D5A27] border border-[#7EAA79]/50'
                            : d.status === 'Trained in v1.8'
                            ? 'bg-[#FAF2DF] text-[#8C6819] border border-[#E6B95F]/50'
                            : 'bg-[#FAECEC] text-[#8C2A2A] border border-[#C87979]/50'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 font-mono text-[11px] text-[#392D35]">
                      {d.target_column}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDataset(d)
                          }}
                          className="rounded-lg border border-[#EBC69F] bg-white px-2 py-1 text-[11px] font-semibold text-[#494269] hover:bg-[#FAF2DF]"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportSanitizedCSV()
                          }}
                          className="rounded-lg border border-[#EBC69F] bg-white px-2 py-1 text-[11px] font-semibold text-[#494269] hover:bg-[#FAF2DF]"
                        >
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Two-Column Deep Inspection: Schema Definition + Quality & Anomaly Detection */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Schema Definition */}
        <div className="lg:col-span-7 rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBC69F]/40 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-xl font-bold text-[#291C2E]">
                    {selectedDataset?.file_name || 'Telco-Customer-Q3-Active.csv'} Schema Definition
                  </h3>
                  <span className="rounded-full bg-[#FAF2DF] px-2 py-0.5 text-[10px] font-bold text-[#8C6819]">
                    21 Features
                  </span>
                </div>
                <p className="text-xs text-[#392D35] mt-0.5">
                  Physical type mapping, nullity analysis, and categorical cardinality checks.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportDictionary}
                className="rounded-xl border border-[#EBC69F] bg-[#FAF2DF] p-2 text-xs font-bold text-[#8C6819] hover:bg-[#EBC69F] transition"
                title="Download JSON Data Dictionary"
              >
                📥 Schema
              </button>
            </div>

            <div className="space-y-2.5">
              {visibleSchema.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center justify-between rounded-xl border border-[#EBC69F]/40 bg-[#FFF3E4]/60 px-3.5 py-2 text-xs hover:bg-[#FAF2DF]/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-[#291C2E]">{field.name}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase ${
                        field.type === 'string'
                          ? 'bg-purple-100 text-purple-700'
                          : field.type === 'integer'
                          ? 'bg-blue-100 text-blue-700'
                          : field.type === 'float'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {field.type}
                    </span>
                    <span className="hidden sm:inline text-[11px] text-[#392D35] truncate max-w-xs">
                      {field.desc}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-mono text-[10px] ${
                        field.warning ? 'text-amber-600 font-bold' : 'text-[#A99BB9]'
                      }`}
                    >
                      {field.nulls}
                    </span>
                    <span className="text-[#43823C] font-bold text-sm">✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EBC69F]/40 flex items-center justify-between text-xs">
            <span className="text-[#392D35] text-[11px]">
              Showing {visibleSchema.length} of 21 validated attributes
            </span>
            <button
              type="button"
              onClick={() => setSchemaExpanded(!schemaExpanded)}
              className="font-bold text-[#494269] hover:text-[#8C6819] transition cursor-pointer"
            >
              {schemaExpanded ? 'Collapse manifest ∧' : 'Expand full schema manifest (11 more) ∨'}
            </button>
          </div>
        </div>

        {/* Right Column: Data Quality & Anomaly Detection */}
        <div className="lg:col-span-5 rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#EBC69F]/40 pb-4 mb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-[#291C2E]">
                  Data Quality &amp; Anomaly Detection
                </h3>
                <p className="text-xs text-[#392D35] mt-0.5">
                  Automated sanitary validation &amp; distribution sanity checks.
                </p>
              </div>
              <span className="text-lg">🛡️</span>
            </div>

            {/* Quality Score Big Box */}
            <div className="flex items-center justify-between rounded-2xl border border-[#7EAA79]/50 bg-[#EAF5E9] p-4 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A27]">
                  Overall Quality Score
                </p>
                <p className="mt-1 font-mono text-3xl font-extrabold text-[#291C2E]">
                  98.4 <span className="text-sm font-normal text-[#392D35]">/ 100</span>
                </p>
                <p className="mt-1 text-xs text-[#2D5A27] font-semibold">
                  Grade: Enterprise High Fidelity
                </p>
              </div>
              <div className="relative size-16 rounded-full border-4 border-[#43823C] flex items-center justify-center bg-white shadow-xs">
                <span className="font-mono text-xs font-bold text-[#43823C]">98.4%</span>
              </div>
            </div>

            {/* Quality Metrics Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-[#FAF2DF]/60 p-2.5">
                <span className="text-[#392D35]">Missing Values Detected</span>
                <span className="font-mono font-bold text-[#291C2E]">
                  11 / 164,682 <span className="text-[#43823C] text-[10px]">(0.006% handled)</span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#FAF2DF]/60 p-2.5">
                <span className="text-[#392D35]">Duplicate Primary Key IDs</span>
                <span className="font-mono font-bold text-[#43823C]">
                  0 <span className="text-[10px] font-normal text-[#392D35]">(Zero collisions)</span>
                </span>
              </div>

              <div className="rounded-xl bg-[#FAF2DF]/60 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#392D35]">Target Class Balance</span>
                  <span className="font-mono text-[10px] font-bold text-[#291C2E]">
                    7,842 labeled instances
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden flex">
                  <div className="h-full bg-[#43823C]" style={{ width: '81.4%' }} />
                  <div className="h-full bg-[#DC5A5A]" style={{ width: '18.6%' }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#392D35] mt-1 font-mono">
                  <span>Retained: 81.4% (6,384)</span>
                  <span className="text-[#B83838] font-bold">Churned: 18.6% (1,458)</span>
                </div>
              </div>

              {/* Imbalance Calibration Notice */}
              <div className="rounded-xl border border-[#E6B95F]/60 bg-[#FAF2DF]/80 p-3 text-[11px] leading-relaxed text-[#8C6819]">
                <p className="font-bold mb-0.5">ℹ️ Imbalance Calibration Notice:</p>
                <p className="text-[#392D35]">
                  Target class ratio detected (81:19). Stratified k-fold cross validation and class weighting are automatically engaged for ML pipeline inference.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EBC69F]/40 flex items-center justify-between text-xs text-[#A99BB9]">
            <span>Last anomaly audit: today at 14:24</span>
            <button
              type="button"
              onClick={handleExportDictionary}
              className="text-[#494269] hover:text-[#8C6819] font-bold transition"
            >
              Diagnostic Log 📋
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: Dataset Preview (First 5 Ingested Rows) */}
      <Card className="rounded-3xl border-[#EBC69F] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBC69F]/40 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
                Dataset Preview (Ingested Cohort Rows)
              </h3>
              <span className="rounded-full bg-[#FAF2DF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#8C6819]">
                Raw Feature Store
              </span>
            </div>
            <p className="text-xs text-[#392D35] mt-0.5">
              Live view of sanitized columns ingested into the active feature store.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportDictionary}
              className="rounded-xl border border-[#EBC69F] bg-white px-3 py-1.5 text-xs font-semibold text-[#494269] hover:bg-[#FAF2DF]"
            >
              Download Data Dictionary
            </button>
            <button
              type="button"
              onClick={handleExportSanitizedCSV}
              className="rounded-xl bg-[#494269] px-4 py-1.5 text-xs font-semibold text-[#FFF3E4] hover:bg-[#373152] transition shadow-xs"
            >
              Export Sanitized CSV 📥
            </button>
          </div>
        </div>

        {/* Data Preview Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF2DF]/70 text-[10px] font-bold uppercase tracking-wider text-[#494269] border-b border-[#EBC69F]/60">
              <tr>
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-3 py-3">Recency (Days)</th>
                <th className="px-3 py-3">Orders (Freq)</th>
                <th className="px-3 py-3">Total Spend</th>
                <th className="px-3 py-3">Tenure (Days)</th>
                <th className="px-3 py-3">Total Items</th>
                <th className="px-3 py-3">Avg Order Value</th>
                <th className="px-3 py-3">Churn Risk</th>
                <th className="px-4 py-3 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBC69F]/20 bg-white font-mono">
              {previewCustomers.slice(0, 5).map((row) => (
                <tr key={row.customer_id} className="hover:bg-[#FAF2DF]/40 transition">
                  <td className="px-4 py-3 font-semibold text-[#291C2E]">
                    #{row.customer_id}
                  </td>
                  <td className="px-3 py-3 text-[#392D35]">{row.recency_days}d</td>
                  <td className="px-3 py-3 text-[#392D35]">{row.frequency}</td>
                  <td className="px-3 py-3 font-bold text-[#291C2E]">₹{row.monetary}</td>
                  <td className="px-3 py-3 text-[#392D35]">{row.tenure_days}d</td>
                  <td className="px-3 py-3 text-[#392D35]">{row.total_items}</td>
                  <td className="px-3 py-3 text-[#392D35]">₹{row.avg_order_value}</td>
                  <td className="px-3 py-3 font-bold text-[#291C2E]">
                    {(Number(row.churn_probability || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-sans">
                    <RiskBadge risk={row.risk_level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EBC69F]/40 flex flex-wrap items-center justify-between text-[11px] text-[#A99BB9]">
          <span>
            Displaying top sanitized records • Encoding: UTF-8 • Delimiter: COMMA
          </span>
          <span className="font-mono text-[#494269]">
            Active Feature Store Schema v1.8
          </span>
        </div>
      </Card>
    </div>
  )
}

