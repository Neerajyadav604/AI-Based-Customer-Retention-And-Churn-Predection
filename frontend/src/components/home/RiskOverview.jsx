// Show the risk analysis section with clearly labelled sample data.
const rows = [
  ['High', 'Customers who need attention soon', 'bg-red-500'],
  ['Medium', 'Customers to check after their usual gap', 'bg-amber-500'],
  ['Low', 'Customers showing steady buying behaviour', 'bg-green-500'],
]

export default function RiskOverview() {
  return (
    <section className="grid items-center gap-10 md:grid-cols-2">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Customer risk overview</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Turn order history into a clear follow-up list.</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">ChurnGuard groups customers into simple risk levels so a small shop owner can decide who to contact first.</p>
        <ul className="mt-6 space-y-3 text-sm text-slate-700">
          {['Filter results by High, Medium or Low risk', 'See the customer signals used for a prediction', 'Download results and keep upload history'].map((text) => (
            <li key={text} className="flex gap-2"><span className="text-indigo-600">✓</span>{text}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(70,60,150,0.08)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <p className="text-sm font-semibold text-slate-900">Risk distribution</p>
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-700">Sample data</span>
        </div>
        <div className="mt-5 space-y-5">
          {rows.map(([level, text, colour], index) => (
            <div key={level}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{level}</span>
                <span className="text-slate-400">{index === 0 ? '92' : index === 1 ? '82' : '126'} customers</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${colour}`} style={{ width: `${[73, 65, 100][index]}%` }} /></div>
              <p className="mt-1 text-[11px] text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
