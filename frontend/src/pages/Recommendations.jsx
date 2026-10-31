import recommendations from '../data/recommendations'
import PageHeader from '../components/PageHeader'

const cardStyles = {
  High: 'border-red-200 bg-red-50',
  Medium: 'border-yellow-200 bg-yellow-50',
  Low: 'border-green-200 bg-green-50',
}

// Explain how a small seller can use the suggested actions.
function HowToUse() {
  return (
    <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-900">
      <h2 className="text-xl font-semibold">How to use these actions</h2>
      <p className="mt-2">
        Start with the High-risk customers, choose one personal action, and record the response.
        Then use friendly reminders for Medium-risk customers and thank Low-risk customers to keep
        the relationship strong.
      </p>
    </div>
  )
}

// Show simple retention ideas for each risk level.
export default function Recommendations() {
  return (
    <section>
      <PageHeader title="Retention recommendations" description="Simple actions a small seller can take for each customer risk level." />
      <div className="grid gap-5 md:grid-cols-3">
        {Object.entries(recommendations).map(([level, actions]) => (
          <article key={level} className={`rounded-lg border p-5 ${cardStyles[level]}`}>
            <h2 className="text-xl font-semibold">{level} risk</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-700">
              {actions.map((action) => <li key={action}>{action}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <HowToUse />
    </section>
  )
}
