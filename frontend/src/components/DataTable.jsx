export default function DataTable({
  columns,
  rows,
  emptyMessage = 'No customer records available.',
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EBC69F]/80 bg-white shadow-sm">
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="size-12 rounded-full bg-[#FFF8ED] flex items-center justify-center text-[#494269] mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="size-6 stroke-current stroke-2">
              <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#392D35]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[#EBC69F]/60 bg-[#FFF8ED]/80">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#494269] ${
                      column.numeric ? 'text-right' : ''
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBC69F]/30">
              {rows.map((row, index) => (
                <tr
                  key={row.id || row.customer_id || index}
                  className="transition-colors hover:bg-[#FFF8ED]/50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`h-14 px-5 py-3 text-[#291C2E] ${
                        column.numeric ? 'text-right font-mono' : ''
                      }`}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
