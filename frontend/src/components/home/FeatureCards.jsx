const features = [
  ['◉', 'Risk for every customer', "High, Medium and Low from the customer's order history."],
  ['↗', 'See what drives churn', 'The Insights page shows which factors matter most to the model.'],
  ['✓', 'Know what to do next', 'Retention actions for each risk level, plus a history of past uploads.'],
]

// Explain the product features.
export default function FeatureCards() {
  return (
    <section id="features" className="scroll-mt-8 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Built for practical retention</p>
      <h2 className="mx-auto mt-2 max-w-xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Understand risk. Take the next useful action.</h2>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
        {features.map(([icon, title, text]) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-flex size-8 items-center justify-center rounded bg-indigo-50 text-sm text-indigo-600">{icon}</span>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
