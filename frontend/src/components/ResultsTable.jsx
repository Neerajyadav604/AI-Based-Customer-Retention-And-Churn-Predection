import { useMemo, useState } from 'react'
import RiskBadge from './RiskBadge'

const pageSize = 20

// Convert prediction rows into a CSV download.
function downloadResults(rows) {
  const columns = ['customer_id', 'recency_days', 'frequency', 'monetary', 'churn_probability', 'risk_level']
  const content = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? '')).join(',')),
  ].join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' }))
  link.download = 'churn-results.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

// Filter, paginate, and display batch prediction rows.
export default function ResultsTable({ customers }) {
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const sortedCustomers = useMemo(
    () => [...customers].sort((first, second) => second.churn_probability - first.churn_probability),
    [customers],
  )
  const filteredCustomers = filter === 'All'
    ? sortedCustomers
    : sortedCustomers.filter((customer) => customer.risk_level === filter)
  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const visibleCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize)

  function changeFilter(event) {
    setFilter(event.target.value)
    setPage(1)
  }

  return (
    <section className="mt-8 rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Customer results</h2>
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={changeFilter} className="rounded border border-slate-300 px-3 py-2 text-sm">
            {['All', 'High', 'Medium', 'Low'].map((level) => <option key={level}>{level}</option>)}
          </select>
          <button type="button" onClick={() => downloadResults(filteredCustomers)} className="rounded bg-blue-700 px-3 py-2 text-sm text-white">
            Download results CSV
          </button>
        </div>
      </div>
      {visibleCustomers.length === 0 ? (
        <p className="py-6 text-slate-500">No customers match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Recency</th><th className="px-3 py-3">Orders</th><th className="px-3 py-3">Spend</th><th className="px-3 py-3">Probability</th><th className="px-3 py-3">Risk</th></tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.customer_id} className="border-b border-slate-100">
                  <td className="px-3 py-3">{customer.customer_id}</td>
                  <td className="px-3 py-3">{customer.recency_days}</td>
                  <td className="px-3 py-3">{customer.frequency}</td>
                  <td className="px-3 py-3">{customer.monetary}</td>
                  <td className="px-3 py-3">{(customer.churn_probability * 100).toFixed(1)}%</td>
                  <td className="px-3 py-3"><RiskBadge riskLevel={customer.risk_level} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Page {page} of {pageCount}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Previous</button>
          <button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </section>
  )
}
