// Explain the purpose, method, and limits of the project.
export default function About() {
  return (
    <section className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="mb-3 text-4xl font-bold text-slate-900">About ChurnGuard</h1>
        <p className="text-lg text-slate-600">This final-year project helps small online sellers, local vendors, and kirana stores understand customer churn and plan simple retention follow-ups.</p>
      </div>
      <div>
        <h2 className="mb-3 text-2xl font-bold">How it works in plain words</h2>
        <p className="text-slate-600">The model looks at three useful parts of a customer’s buying history:</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="rounded-lg bg-white p-5 shadow-sm"><strong>Recency</strong><p className="mt-2 text-slate-600">How many days since the last order.</p></li>
          <li className="rounded-lg bg-white p-5 shadow-sm"><strong>Frequency</strong><p className="mt-2 text-slate-600">How often the customer orders.</p></li>
          <li className="rounded-lg bg-white p-5 shadow-sm"><strong>Monetary</strong><p className="mt-2 text-slate-600">How much the customer spends.</p></li>
        </ul>
      </div>
      <div>
        <h2 className="mb-3 text-2xl font-bold">Technology stack</h2>
        <ul className="list-inside list-disc space-y-1 text-slate-600">
          <li>React with Vite and JavaScript</li>
          <li>Tailwind CSS utility classes</li>
          <li>FastAPI backend and a machine-learning model</li>
          <li>Recharts for dashboard visualizations</li>
        </ul>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <h2 className="text-2xl font-bold">Limitations</h2>
        <p className="mt-3">The baseline model was trained on a public UK online-retail dataset. That dataset may not perfectly represent every local seller, product category, or customer group. Predictions are estimates and should support, not replace, a seller’s personal judgement.</p>
      </div>
      <div>
        <h2 className="mb-3 text-2xl font-bold">Our team</h2>
        <p className="text-slate-600">Student project team placeholder. Team member names and responsibilities can be added here.</p>
      </div>
    </section>
  )
}
