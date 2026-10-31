const cards = [
  ['total', 'Total customers', 'bg-blue-50 text-blue-800'],
  ['high', 'High risk', 'bg-red-50 text-red-800'],
  ['medium', 'Medium risk', 'bg-yellow-50 text-yellow-800'],
  ['low', 'Low risk', 'bg-green-50 text-green-800'],
]

// Show the four summary counts returned by the batch prediction.
export default function SummaryCards({ summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([name, label, colour]) => (
        <div key={name} className={`rounded-lg p-4 ${colour}`}>
          <p className="text-sm">{label}</p>
          <p className="mt-1 text-2xl font-bold">{summary?.[name] ?? 0}</p>
        </div>
      ))}
    </div>
  )
}
