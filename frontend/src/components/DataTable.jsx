// Render a consistent table frame for API data.
export default function DataTable({ columns, rows, emptyMessage = 'No data available.' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {columns.map((column) => <th key={column.key} className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${column.numeric ? 'text-right' : ''}`}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || row.customer_id || index} className="border-b border-slate-100 hover:bg-slate-50/60">
                {columns.map((column) => <td key={column.key} className={`h-[52px] px-4 py-3 ${column.numeric ? 'text-right font-mono' : ''}`}>{column.render ? column.render(row) : row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
