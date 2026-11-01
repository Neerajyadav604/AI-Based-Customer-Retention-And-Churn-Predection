// Show a dark visual summary of the retention workflow.
const actions = [
  ['01', 'Find the signal', 'Use recency, frequency, spend and other order details.'],
  ['02', 'Choose the customer', 'Start with the people in the High risk group.'],
  ['03', 'Take the next action', 'Send a reminder, personal message or small offer.'],
]

export default function RetentionHighlight() {
  return (
    <section className="rounded-lg bg-[#17213b] px-5 py-10 text-white shadow-[0_12px_30px_rgba(23,33,59,0.18)] sm:px-10">
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Practical customer retention</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Less guessing. More useful follow-up.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">Use the prediction as a simple starting point for the next conversation with your customer.</p>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {actions.map(([number, title, text]) => (
          <article key={number} className="rounded border border-white/10 bg-white/10 p-4">
            <span className="font-mono text-sm text-indigo-300">{number}</span>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-300">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
