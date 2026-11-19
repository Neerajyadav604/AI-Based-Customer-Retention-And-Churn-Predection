import { useMemo, useState } from 'react'
import RiskBadge from './RiskBadge'
import { DoodleAvatar, DoodleSparkle } from './Doodles'
import {
  getRiskLevel,
  normalizeProbability,
  getRiskPriority,
  RISK_PALETTE,
} from '../utils/risk'

const pageSize = 10

function downloadResults(rows) {
  const columns = [
    'customer_id',
    'recency_days',
    'frequency',
    'monetary',
    'tenure_days',
    'total_items',
    'avg_order_value',
    'churn_probability',
    'risk_level',
  ]
  const content = [
    columns.join(','),
    ...rows.map((row) =>
      columns
        .map((column) => {
          if (column === 'risk_level') {
            return JSON.stringify(getRiskLevel(row.churn_probability))
          }
          if (column === 'churn_probability') {
            return JSON.stringify(`${normalizeProbability(row.churn_probability).toFixed(1)}%`)
          }
          return JSON.stringify(row[column] ?? '')
        })
        .join(','),
    ),
  ].join('\n')

  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' }))
  link.download = `churnguard-customers-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function ResultsTable({
  customers = [],
  externalFilter = 'All',
  onFilterChange,
  probabilityRangeFilter = null,
  onClearRangeFilter,
  onSelectCustomer,
}) {
  const [internalFilter, setInternalFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [toastMessage, setToastMessage] = useState('')

  const activeFilter = onFilterChange ? externalFilter : internalFilter
  const setActiveFilter = (val) => {
    if (onFilterChange) {
      onFilterChange(val)
    } else {
      setInternalFilter(val)
    }
    setPage(1)
  }

  // Calculate dynamic counts across the entire provided cohort
  const cohortCounts = useMemo(() => {
    let high = 0
    let medium = 0
    let low = 0

    customers.forEach((c) => {
      const risk = getRiskLevel(c.churn_probability)
      if (risk === 'High') high++
      else if (risk === 'Medium') medium++
      else low++
    })

    return { total: customers.length, high, medium, low }
  }, [customers])

  // Sort customers by Risk Urgency: High first, Medium second, Low last; within tier, by highest probability
  const sortedCustomers = useMemo(() => {
    return [...customers].map((c) => ({
      ...c,
      normalizedProb: normalizeProbability(c.churn_probability),
      dynamicRisk: getRiskLevel(c.churn_probability),
    })).sort((a, b) => {
      const priorityA = getRiskPriority(a.dynamicRisk)
      const priorityB = getRiskPriority(b.dynamicRisk)
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      return b.normalizedProb - a.normalizedProb
    })
  }, [customers])

  // Filter customers by selected risk category, probability range, and search ID
  const filteredCustomers = useMemo(() => {
    return sortedCustomers.filter((c) => {
      // 1. Risk level filter
      const matchFilter = activeFilter === 'All' || c.dynamicRisk === activeFilter

      // 2. Probability range filter (e.g. from bar chart clicks: '21-40')
      let matchRange = true
      if (probabilityRangeFilter) {
        const [minStr, maxStr] = probabilityRangeFilter.split('-')
        const min = parseFloat(minStr)
        const max = parseFloat(maxStr)
        matchRange = c.normalizedProb >= min && c.normalizedProb <= max
      }

      // 3. Search query
      const matchSearch =
        !search.trim() ||
        String(c.customer_id).toLowerCase().includes(search.toLowerCase())

      return matchFilter && matchRange && matchSearch
    })
  }, [sortedCustomers, activeFilter, probabilityRangeFilter, search])

  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const visibleCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize)

  const handleExport = () => {
    downloadResults(filteredCustomers)
    setToastMessage(`Exported ${filteredCustomers.length} customer records to CSV!`)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Visual distribution bar percentages
  const total = cohortCounts.total || 1
  const lowPct = ((cohortCounts.low / total) * 100).toFixed(1)
  const medPct = ((cohortCounts.medium / total) * 100).toFixed(1)
  const highPct = ((cohortCounts.high / total) * 100).toFixed(1)

  return (
    <section className="relative rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm sm:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-20 flex items-center gap-2 rounded-2xl border border-[#7EAA79] bg-[#EAF5E9] px-4 py-2.5 text-xs font-bold text-[#2D5A27] shadow-lg animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Dynamic Distribution Bar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-[#EBC69F]/40 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
                Customer Risk Cohorts
              </h3>
              <DoodleSparkle size={18} className="text-[#E6B95F]" />
            </div>
            <p className="mt-1 text-xs text-[#392D35]">
              Showing {filteredCustomers.length} evaluated accounts sorted by risk urgency. Click any row for individual diagnosis.
            </p>
          </div>

          {/* Table Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <input
              type="text"
              placeholder="Search customer ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-[#EBC69F] bg-[#FFF3E4] px-3.5 py-2 text-xs text-[#291C2E] placeholder-[#A99BB9] focus:border-[#494269] focus:outline-none"
            />

            {/* Functional Risk Filter Tabs with Dynamic Counts & Toggle behavior */}
            <div className="flex rounded-xl bg-[#FAF2DF] p-1 text-xs border border-[#EBC69F]/60 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('All')}
                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeFilter === 'All'
                    ? 'bg-[#494269] text-[#FFF3E4] shadow-xs font-bold scale-[1.02]'
                    : 'text-[#494269] hover:bg-[#EBC69F]/40'
                }`}
              >
                All ({cohortCounts.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'High' ? 'All' : 'High')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeFilter === 'High'
                    ? 'bg-[#B83838] text-white shadow-xs font-bold ring-2 ring-[#E6B95F] scale-[1.02]'
                    : 'text-[#8C2A2A] hover:bg-[#FAECEC]'
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#B83838]" />
                High ({cohortCounts.high})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'Medium' ? 'All' : 'Medium')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeFilter === 'Medium'
                    ? 'bg-[#E6B95F] text-[#291C2E] shadow-xs font-bold ring-2 ring-[#291C2E] scale-[1.02]'
                    : 'text-[#8C6819] hover:bg-[#FAF2DF]'
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#D6A34E]" />
                Medium ({cohortCounts.medium})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'Low' ? 'All' : 'Low')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeFilter === 'Low'
                    ? 'bg-[#43823C] text-white shadow-xs font-bold ring-2 ring-[#E6B95F] scale-[1.02]'
                    : 'text-[#2D5A27] hover:bg-[#EAF5E9]'
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#43823C]" />
                Low ({cohortCounts.low})
              </button>
            </div>

            {/* Clear Range Filter if active */}
            {probabilityRangeFilter && (
              <button
                type="button"
                onClick={onClearRangeFilter}
                className="rounded-xl border border-[#E6B95F] bg-[#FAF2DF] px-3.5 py-1.5 text-xs font-bold text-[#8C6819] hover:bg-[#EBC69F] transition-all flex items-center gap-1.5 shadow-xs animate-fade-in"
              >
                <span className="size-2 rounded-full bg-[#E6B95F] animate-pulse" />
                <span>Band: {probabilityRangeFilter}%</span>
                <span>✕</span>
              </button>
            )}

            {/* Export CSV button */}
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E6B95F] px-4 py-2 text-xs font-semibold text-[#291C2E] shadow-sm hover:bg-[#D6A34E] transition btn-interactive"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-4 stroke-current stroke-2">
                <path d="M12 3v12m0 0l4-4m-4 4L8 11M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Dynamic Risk Distribution Bar */}
        <div className="mt-2 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-[#392D35]">
            <span>Portfolio Cohort Distribution</span>
            <span>
              Low: <strong className="text-[#2D5A27]">{cohortCounts.low}</strong> ({lowPct}%) • Medium: <strong className="text-[#8C6819]">{cohortCounts.medium}</strong> ({medPct}%) • High: <strong className="text-[#8C2A2A]">{cohortCounts.high}</strong> ({highPct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#FAF2DF] overflow-hidden flex border border-[#EBC69F]/50">
            <div
              className="h-full bg-[#43823C] transition-all duration-500"
              style={{ width: `${lowPct}%` }}
              title={`Low: ${lowPct}%`}
            />
            <div
              className="h-full bg-[#E6B95F] transition-all duration-500"
              style={{ width: `${medPct}%` }}
              title={`Medium: ${medPct}%`}
            />
            <div
              className="h-full bg-[#B83838] transition-all duration-500"
              style={{ width: `${highPct}%` }}
              title={`High: ${highPct}%`}
            />
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#EBC69F]/50">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-[#FFF8ED]/90 text-[11px] font-bold uppercase tracking-wider text-[#494269] border-b border-[#EBC69F]/60">
            <tr>
              <th className="px-5 py-3.5">Customer Profile</th>
              <th className="px-4 py-3.5 text-right">Recency (Days)</th>
              <th className="px-4 py-3.5 text-right">Orders</th>
              <th className="px-4 py-3.5 text-right">Total Spend</th>
              <th className="px-5 py-3.5 text-center">Churn Probability</th>
              <th className="px-4 py-3.5 text-center">Risk Level</th>
              <th className="px-4 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBC69F]/30 bg-white">
            {visibleCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-sm text-[#392D35]">
                  No matching customer accounts found in this filter range.
                </td>
              </tr>
            ) : (
              visibleCustomers.map((c, i) => {
                const prob = c.normalizedProb
                const risk = c.dynamicRisk
                const colors = RISK_PALETTE[risk] || RISK_PALETTE.Low

                return (
                  <tr
                    key={c.customer_id || i}
                    onClick={() => onSelectCustomer?.(c)}
                    className="cursor-pointer transition hover:bg-[#FAF2DF]/40 group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <DoodleAvatar id={Number(String(c.customer_id).replace(/\D/g, '')) || (i + 1)} size={34} />
                        <div>
                          <p className="font-mono text-xs font-semibold text-[#291C2E] group-hover:text-[#494269]">
                            {c.customer_id}
                          </p>
                          <p className="text-[10px] text-[#A99BB9]">Active Account</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-[#291C2E]">
                      {c.recency_days ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-[#291C2E]">
                      {c.frequency ?? 1}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-[#291C2E]">
                      ₹{Number(c.monetary || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-2.5">
                        <div className="w-16 h-2 rounded-full bg-[#FAF2DF] overflow-hidden p-0.5 border border-[#EBC69F]/40">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${prob}%`,
                              backgroundColor: colors.bar,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-[#291C2E]">
                          {prob.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <RiskBadge riskLevel={risk} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectCustomer?.(c)
                        }}
                        className="rounded-lg border border-[#EBC69F] bg-[#FAF2DF]/60 px-2.5 py-1 text-[11px] font-semibold text-[#494269] hover:bg-[#494269] hover:text-[#FFF3E4] transition shadow-2xs"
                      >
                        View Insights →
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-[#EBC69F]/40 pt-4 text-xs text-[#392D35]">
          <p>
            Page {page} of {pageCount} ({filteredCustomers.length} total displayed)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-[#EBC69F] bg-[#FFF3E4] px-3.5 py-1.5 font-medium text-[#291C2E] disabled:opacity-40 hover:bg-[#FAF2DF] transition"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded-xl border border-[#EBC69F] bg-[#FFF3E4] px-3.5 py-1.5 font-medium text-[#291C2E] disabled:opacity-40 hover:bg-[#FAF2DF] transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
