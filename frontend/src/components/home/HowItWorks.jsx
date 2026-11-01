const steps = [
  ['01', 'Upload a CSV', 'Upload a CSV with customer, date and amount.'],
  ['02', 'Get a risk score', 'Get a risk score and a High, Medium or Low label for each customer.'],
  ['03', 'Follow the action', 'Follow the suggested retention actions and track your uploads in History.'],
]

// Explain the three simple product steps.
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-8 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">How it works</p>
      <h2 className="mx-auto mt-2 max-w-xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">From order list to next action</h2>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
        {steps.map(([number, title, text]) => (
          <article key={number} className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="font-mono text-sm text-indigo-600">{number}</span>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
