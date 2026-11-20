import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  getUploadHistory,
  getUploadDetails,
  downloadUploadResults,
  deleteUpload,
} from '../api'
import ErrorMessage from '../components/ErrorMessage'
import Spinner from '../components/Spinner'
import Card from '../components/Card'
import RiskBadge from '../components/RiskBadge'
import { DoodleSparkle } from '../components/Doodles'

const pageSize = 10

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function History() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)

  // Specific historical upload details modal
  const [selectedUploadId, setSelectedUploadId] = useState(null)
  const [uploadDetail, setUploadDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  // Delete upload states
  const [uploadToDelete, setUploadToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [toastMessage, setToastMessage] = useState(null)

  async function handleConfirmDelete() {
    if (!uploadToDelete?.id || isDeleting) return
    setIsDeleting(true)
    setDeleteError('')

    const targetId = uploadToDelete.id
    const targetName = uploadToDelete.file_name || `Upload #${targetId}`

    try {
      await deleteUpload(targetId)

      // 1. Immediately remove from UI without page refresh
      setUploads((prev) => prev.filter((u) => u.id !== targetId))

      // 2. If the detail modal was inspecting this deleted upload, close it
      if (selectedUploadId === targetId) {
        setSelectedUploadId(null)
        setUploadDetail(null)
      }

      // 3. Clean up cached session dataset if it matches
      try {
        const cached = sessionStorage.getItem('churnguard_latest_retention_dataset')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed?.uploadId === targetId) {
            sessionStorage.removeItem('churnguard_latest_retention_dataset')
          }
        }
      } catch (e) {
        console.warn('Session cache cleanup:', e)
      }

      // 4. Show success notification
      setToastMessage({
        type: 'success',
        message: `Upload record "${targetName}" was permanently deleted.`,
      })
      setTimeout(() => setToastMessage(null), 4500)

      setUploadToDelete(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete upload record from database.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function fetchHistory(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const data = await getUploadHistory()
      setUploads(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch upload history.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // View Details of a specific historical upload
  async function handleViewDetails(uploadId) {
    setSelectedUploadId(uploadId)
    setDetailLoading(true)
    setDetailError('')
    setUploadDetail(null)
    setCustomerSearch('')
    try {
      const details = await getUploadDetails(uploadId)
      setUploadDetail(details)
    } catch (err) {
      setDetailError(err.message || 'Unable to load details for this upload.')
    } finally {
      setDetailLoading(false)
    }
  }

  // Export results for a specific upload
  async function handleDownload(uploadId, fileName) {
    setDownloadingId(uploadId)
    try {
      const blob = await downloadUploadResults(uploadId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const name = fileName ? fileName.replace(/\.[^/.]+$/, '') : `upload_${uploadId}`
      a.download = `churnguard_${name}_predictions.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      alert(`Download failed: ${err.message}`)
    } finally {
      setDownloadingId(null)
    }
  }

  // Filtered uploads list
  const filteredUploads = useMemo(() => {
    return uploads.filter((item) => {
      // 1. Search by filename
      const matchSearch =
        !searchQuery.trim() ||
        (item.file_name && item.file_name.toLowerCase().includes(searchQuery.toLowerCase()))

      // 2. Filter by status
      const matchStatus =
        statusFilter === 'All' ||
        (item.status && item.status.toLowerCase() === statusFilter.toLowerCase())

      // 3. Filter by date
      let matchDate = true
      if (dateFilter && item.created_at) {
        matchDate = formatDateShort(item.created_at) === dateFilter
      }

      return matchSearch && matchStatus && matchDate
    })
  }, [uploads, searchQuery, statusFilter, dateFilter])

  const pageCount = Math.max(1, Math.ceil(filteredUploads.length / pageSize))
  const visibleUploads = filteredUploads.slice((page - 1) * pageSize, page * pageSize)

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const counts = { All: uploads.length, Completed: 0, Processing: 0, Failed: 0 }
    uploads.forEach((u) => {
      const s = u.status || 'Completed'
      if (counts[s] !== undefined) counts[s]++
    })
    return counts
  }, [uploads])

  // Filter customers in detail view
  const filteredDetailCustomers = useMemo(() => {
    if (!uploadDetail?.customers) return []
    if (!customerSearch.trim()) return uploadDetail.customers
    const q = customerSearch.toLowerCase()
    return uploadDetail.customers.filter((c) =>
      String(c.customer_id).toLowerCase().includes(q)
    )
  }, [uploadDetail, customerSearch])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner label="Loading historical upload records..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Audit Trail
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#494269]">
              {uploads.length} Upload Records
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Upload History
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Review all previous bulk CSV uploads, process audits, and cohort defection diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchHistory(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl border border-[#EBC69F] bg-white px-4 py-2 text-xs font-semibold text-[#291C2E] shadow-xs hover:bg-[#FAF2DF] transition disabled:opacity-50"
          >
            <span className={`text-base ${refreshing ? 'animate-spin' : ''}`}>↻</span>
            <span>{refreshing ? 'Refreshing...' : 'Refresh History'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-xs font-semibold shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'border-[#7EAA79] bg-[#EAF5E9] text-[#2D5A27]'
              : 'border-[#C87979] bg-[#FAECEC] text-[#8C2A2A]'
          }`}
          role="status"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{toastMessage.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs hover:opacity-75 transition font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Filter Bar: Search, Status Tabs, and Date Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EBC69F]/70 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search by File Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by file name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-56 sm:w-64 rounded-xl border border-[#EBC69F] bg-[#FFF3E4] px-3.5 py-2 text-xs text-[#291C2E] placeholder-[#A99BB9] focus:border-[#494269] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter by Processing Status */}
          <div className="flex rounded-xl bg-[#FAF2DF] p-1 text-xs border border-[#EBC69F]/60">
            {['All', 'Completed', 'Processing', 'Failed'].map((status) => {
              const isSelected = statusFilter === status
              const count = statusCounts[status] || 0
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status)
                    setPage(1)
                  }}
                  className={`rounded-lg px-3 py-1 font-medium transition ${
                    isSelected
                      ? 'bg-[#494269] text-[#FFF3E4] shadow-xs font-bold'
                      : 'text-[#494269] hover:bg-[#EBC69F]/40'
                  }`}
                >
                  {status} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#392D35] font-medium">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-[#EBC69F] bg-[#FFF3E4] px-2.5 py-1.5 text-xs text-[#291C2E] focus:border-[#494269] focus:outline-none"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs text-[#8C6819] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Uploads History Table */}
      <Card className="rounded-3xl border-[#EBC69F] p-0 overflow-hidden shadow-sm">
        {visibleUploads.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#392D35]">
            No historical upload records found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-[#FFF8ED]/90 text-[11px] font-bold uppercase tracking-wider text-[#494269] border-b border-[#EBC69F]/60">
                <tr>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-5 py-4">Upload Date</th>
                  <th className="px-5 py-4 text-center">Total Records</th>
                  <th className="px-5 py-4 text-center">Processed</th>
                  <th className="px-5 py-4 text-center">Failed</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBC69F]/30 bg-white">
                {visibleUploads.map((item) => {
                  const status = item.status || 'Completed'
                  return (
                    <tr key={item.id} className="transition hover:bg-[#FFF8ED]/40">
                      {/* File Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-xl bg-[#FAF2DF] text-[#8C6819] font-bold text-xs">
                            📄
                          </span>
                          <div>
                            <p className="font-semibold text-xs text-[#291C2E] max-w-xs truncate">
                              {item.file_name || `Upload #${item.id}`}
                            </p>
                            <p className="font-mono text-[10px] text-[#A99BB9]">
                              ID: #{item.id} • {item.total || 0} customers
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Upload Date */}
                      <td className="px-5 py-4 font-mono text-xs text-[#392D35]">
                        {formatDate(item.created_at)}
                      </td>

                      {/* Total Records */}
                      <td className="px-5 py-4 text-center font-mono text-xs font-semibold text-[#291C2E]">
                        {(item.total_records || item.total || 0).toLocaleString()}
                      </td>

                      {/* Processed */}
                      <td className="px-5 py-4 text-center font-mono text-xs font-semibold text-[#43823C]">
                        {(item.processed_records || item.total || 0).toLocaleString()}
                      </td>

                      {/* Failed */}
                      <td className="px-5 py-4 text-center font-mono text-xs font-semibold">
                        {item.failed_records > 0 ? (
                          <span className="rounded-md bg-[#FAECEC] px-2 py-0.5 text-[#B83838]">
                            {item.failed_records}
                          </span>
                        ) : (
                          <span className="text-[#A99BB9]">0</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            status === 'Completed'
                              ? 'bg-[#EAF5E9] text-[#2D5A27] border border-[#7EAA79]/50'
                              : status === 'Failed'
                              ? 'bg-[#FAECEC] text-[#8C2A2A] border border-[#C87979]/50'
                              : 'bg-[#FAF2DF] text-[#8C6819] border border-[#E6B95F]/50'
                          }`}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                status === 'Completed'
                                  ? '#43823C'
                                  : status === 'Failed'
                                  ? '#B83838'
                                  : '#E6B95F',
                            }}
                          />
                          {status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(item.id)}
                            className="rounded-xl border border-[#494269] bg-[#FAF2DF] px-3 py-1.5 text-xs font-semibold text-[#494269] hover:bg-[#EBC69F]/50 transition cursor-pointer"
                          >
                            View Details
                          </button>
                          {status === 'Completed' && (
                            <button
                              type="button"
                              disabled={downloadingId === item.id}
                              onClick={() => handleDownload(item.id, item.file_name)}
                              className="rounded-xl border border-[#EBC69F] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#494269] hover:bg-[#FAF2DF] transition disabled:opacity-50"
                              title="Download Excel Workbook"
                            >
                              {downloadingId === item.id ? '...' : '📥'}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isDeleting && uploadToDelete?.id === item.id}
                            onClick={() => {
                              setDeleteError('')
                              setUploadToDelete(item)
                            }}
                            className="rounded-xl border border-[#EBC69F] bg-white p-2 text-xs font-semibold text-[#8C2A2A] hover:bg-[#FAECEC] hover:border-[#C87979] hover:text-[#B83838] transition disabled:opacity-50 cursor-pointer shadow-2xs"
                            title="Delete Upload from History"
                            aria-label={`Delete upload ${item.file_name || item.id}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-current stroke-2">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-[#EBC69F]/40 p-4 text-xs text-[#392D35] bg-[#FFF8ED]/40">
            <p>
              Page {page} of {pageCount} ({filteredUploads.length} total uploads)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-[#EBC69F] bg-white px-3 py-1 font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-xl border border-[#EBC69F] bg-white px-3 py-1 font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Previous Upload Details Modal / Drawer */}
      {selectedUploadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#291C2E]/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#EBC69F] bg-[#FFF3E4] p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EBC69F]/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#EBC69F]/50 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
                    Historical Record #{selectedUploadId}
                  </span>
                  {uploadDetail && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        uploadDetail.status === 'Completed'
                          ? 'bg-[#EAF5E9] text-[#2D5A27]'
                          : 'bg-[#FAECEC] text-[#8C2A2A]'
                      }`}
                    >
                      {uploadDetail.status}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-editorial text-2xl font-bold text-[#291C2E]">
                  {uploadDetail?.file_name || `Upload #${selectedUploadId}`}
                </h2>
                <p className="font-mono text-xs text-[#392D35]">
                  Uploaded on {formatDate(uploadDetail?.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {uploadDetail?.status === 'Completed' && (
                  <>
                    <Link
                      to={`/retention-intelligence?upload_id=${uploadDetail.id}`}
                      className="rounded-xl border border-[#E6B95F] bg-[#FAF2DF] px-3.5 py-1.5 text-xs font-bold text-[#8C6819] hover:bg-[#EBC69F] transition flex items-center gap-1.5"
                    >
                      <span>🎯 Retention Insights</span>
                      <span>→</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDownload(uploadDetail.id, uploadDetail.file_name)}
                      className="rounded-xl bg-[#494269] px-3.5 py-1.5 text-xs font-semibold text-[#FFF3E4] hover:bg-[#373152] transition"
                    >
                      Export Excel 📥
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError('')
                    setUploadToDelete(uploadDetail)
                  }}
                  className="rounded-xl border border-[#C87979]/60 bg-white p-2 text-xs font-semibold text-[#8C2A2A] hover:bg-[#FAECEC] hover:border-[#C87979] hover:text-[#B83838] transition shadow-2xs"
                  title="Delete Upload from History"
                  aria-label="Delete this upload"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="size-4 stroke-current stroke-2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUploadId(null)}
                  className="rounded-xl border border-[#EBC69F] bg-white p-2 text-sm text-[#494269] hover:bg-[#FAF2DF] transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {detailLoading ? (
              <div className="py-16">
                <Spinner label="Loading historical prediction audit..." />
              </div>
            ) : detailError ? (
              <div className="py-8">
                <ErrorMessage message={detailError} />
              </div>
            ) : uploadDetail ? (
              <div className="mt-6 space-y-6">
                {/* Error Banner if Failed */}
                {uploadDetail.status === 'Failed' && uploadDetail.error_details && (
                  <div className="rounded-2xl border border-[#C87979] bg-[#FAECEC] p-4 text-xs text-[#8C2A2A]">
                    <p className="font-bold mb-1">⚠️ Processing Error Details:</p>
                    <p className="font-mono">{uploadDetail.error_details}</p>
                  </div>
                )}

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-[#EBC69F]/80 bg-white p-4 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#494269]/70">Total Customers</p>
                    <p className="mt-1 font-mono text-2xl font-extrabold text-[#291C2E]">
                      {uploadDetail.total || uploadDetail.customer_count || 0}
                    </p>
                    <p className="text-[10px] text-[#A99BB9]">
                      {uploadDetail.total_records || 0} order records
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#C87979]/50 bg-[#FAECEC]/60 p-4 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#8C2A2A]">High Risk</p>
                    <p className="mt-1 font-mono text-2xl font-extrabold text-[#B83838]">
                      {uploadDetail.high || 0}
                    </p>
                    <p className="text-[10px] text-[#8C2A2A]">Defection probability &gt; 60%</p>
                  </div>

                  <div className="rounded-2xl border border-[#E6B95F]/50 bg-[#FAF2DF]/60 p-4 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#8C6819]">Medium Risk</p>
                    <p className="mt-1 font-mono text-2xl font-extrabold text-[#D6A34E]">
                      {uploadDetail.medium || 0}
                    </p>
                    <p className="text-[10px] text-[#8C6819]">Probability 30% - 60%</p>
                  </div>

                  <div className="rounded-2xl border border-[#7EAA79]/50 bg-[#EAF5E9]/60 p-4 text-center">
                    <p className="text-[10px] font-bold uppercase text-[#2D5A27]">Low Risk</p>
                    <p className="mt-1 font-mono text-2xl font-extrabold text-[#43823C]">
                      {uploadDetail.low || 0}
                    </p>
                    <p className="text-[10px] text-[#2D5A27]">Avg {(Number(uploadDetail.avg_probability || 0) * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {/* Probability Distribution Breakdown for this Specific Upload */}
                {uploadDetail.distribution && (
                  <div className="rounded-2xl border border-[#EBC69F]/80 bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-editorial text-base font-bold text-[#291C2E]">
                        Churn Probability Distribution
                      </h3>
                      <span className="text-[11px] text-[#392D35]">
                        Cohort Breakdown ({uploadDetail.customer_count || 0} accounts)
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      {[
                        { label: '0–20%', name: 'Very Low', key: '0-20', color: '#43823C' },
                        { label: '21–40%', name: 'Low', key: '21-40', color: '#68A860' },
                        { label: '41–60%', name: 'Moderate', key: '41-60', color: '#E6B95F' },
                        { label: '61–80%', name: 'High', key: '61-80', color: '#DC5A5A' },
                        { label: '81–100%', name: 'Critical', key: '81-100', color: '#A82828' },
                      ].map((b) => {
                        const count = uploadDetail.distribution[b.key] || 0
                        const pct = uploadDetail.customer_count > 0
                          ? ((count / uploadDetail.customer_count) * 100).toFixed(0)
                          : 0
                        return (
                          <div key={b.key} className="rounded-xl border border-[#EBC69F]/40 bg-[#FAF2DF]/50 p-2.5">
                            <span className="text-[10px] font-bold" style={{ color: b.color }}>
                              {b.label}
                            </span>
                            <p className="font-mono text-lg font-extrabold text-[#291C2E] mt-0.5">
                              {count}
                            </p>
                            <p className="text-[10px] text-[#A99BB9]">{pct}% share</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Customer Level Predictions from THIS Specific Historical Upload */}
                <div className="rounded-2xl border border-[#EBC69F]/80 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-editorial text-lg font-bold text-[#291C2E]">
                        Customer Predictions from this Upload
                      </h3>
                      <p className="text-xs text-[#392D35]">
                        Inspecting {filteredDetailCustomers.length} customer results evaluated during this run.
                      </p>
                    </div>

                    <input
                      type="text"
                      placeholder="Filter customer ID..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="rounded-xl border border-[#EBC69F] bg-[#FFF3E4] px-3 py-1.5 text-xs text-[#291C2E] placeholder-[#A99BB9] focus:outline-none"
                    />
                  </div>

                  {filteredDetailCustomers.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[#392D35]">
                      No customer predictions recorded for this upload.
                    </p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#FAF2DF] text-[10px] font-bold uppercase tracking-wider text-[#494269] border-b border-[#EBC69F]">
                          <tr>
                            <th className="px-3 py-2.5">Customer ID</th>
                            <th className="px-3 py-2.5">Recency</th>
                            <th className="px-3 py-2.5">Orders</th>
                            <th className="px-3 py-2.5">Total Spend</th>
                            <th className="px-3 py-2.5">Churn Risk</th>
                            <th className="px-3 py-2.5 text-right">Risk Tier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBC69F]/20">
                          {filteredDetailCustomers.map((c) => (
                            <tr key={c.customer_id} className="hover:bg-[#FAF2DF]/40">
                              <td className="px-3 py-2 font-mono font-semibold text-[#291C2E]">
                                #{c.customer_id}
                              </td>
                              <td className="px-3 py-2 text-[#392D35]">{c.recency_days}d</td>
                              <td className="px-3 py-2 text-[#392D35]">{c.frequency}</td>
                              <td className="px-3 py-2 font-mono font-medium text-[#291C2E]">
                                ₹{c.monetary}
                              </td>
                              <td className="px-3 py-2 font-mono font-bold text-[#291C2E]">
                                {(Number(c.churn_probability || 0) * 100).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2 text-right">
                                <RiskBadge risk={c.risk_level} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION DIALOG MODAL
          ======================================================== */}
      {uploadToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-3xl border-2 border-[#EBC69F] bg-[#FFF8ED] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#FAECEC] border border-[#C87979]/50 text-[#8C2A2A] shadow-xs">
                <svg viewBox="0 0 24 24" fill="none" className="size-6 stroke-current stroke-2">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <div>
                <h3
                  id="delete-dialog-title"
                  className="font-editorial text-xl font-bold text-[#291C2E]"
                >
                  Delete Upload?
                </h3>
                <p className="mt-1 text-xs text-[#392D35] leading-relaxed">
                  Are you sure you want to permanently delete this upload from your history?
                </p>
              </div>
            </div>

            {/* Target Item Summary */}
            <div className="rounded-2xl border border-[#EBC69F] bg-white p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#291C2E] truncate">
                  📄 {uploadToDelete.file_name || `Upload #${uploadToDelete.id}`}
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#A99BB9]">
                ID: #{uploadToDelete.id} • {uploadToDelete.total || uploadToDelete.customer_count || 0} accounts evaluated
              </p>
              <p className="text-[11px] text-[#8C2A2A] pt-1 font-medium leading-relaxed">
                ⚠️ This will permanently remove the uploaded customer orders, predictions, and retention analysis for this dataset.
              </p>
            </div>

            {deleteError && <ErrorMessage message={deleteError} />}

            {/* Actions: Cancel and Delete */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EBC69F]/50">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setUploadToDelete(null)
                  setDeleteError('')
                }}
                className="rounded-xl border border-[#EBC69F] bg-white px-4 py-2 text-xs font-semibold text-[#494269] hover:bg-[#FAF2DF] transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-[#B83838] px-5 py-2 text-xs font-bold text-white hover:bg-[#8C2A2A] shadow-xs hover:shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin text-sm">↻</span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
