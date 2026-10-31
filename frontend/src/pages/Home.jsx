import { Link } from 'react-router-dom'

const features = [
  ['Simple predictions', 'Understand which customers may stop buying without needing a data science background.'],
  ['Useful actions', 'Turn each risk result into a practical retention action for your shop.'],
  ['Made for small sellers', 'Use customer order data from a local store, online shop, or kirana business.'],
]

const steps = [
  ['1', 'Enter or upload data', 'Enter one customer’s details or upload your CSV file.'],
  ['2', 'See the risk', 'The model gives a churn probability and a Low, Medium, or High risk level.'],
  ['3', 'Take action', 'Use the suggested action to follow up with the customer personally.'],
]

// Introduce the churn prediction app.
export default function Home() {
  return (
    <section className="space-y-16">
      <div className="rounded-2xl bg-blue-700 px-5 py-12 text-white sm:px-10 sm:py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-100">Customer retention made simple</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Know who may leave before they do.</h1>
        <p className="mt-5 max-w-2xl text-lg text-blue-100">ChurnGuard helps small sellers find customers who may stop buying and choose a friendly next step.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/predict" className="rounded-lg bg-white px-5 py-3 text-center font-semibold text-blue-700 outline-none hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-200">Predict a customer</Link>
          <Link to="/upload" className="rounded-lg border border-blue-200 px-5 py-3 text-center font-semibold text-white outline-none hover:bg-blue-600 focus-visible:ring-4 focus-visible:ring-blue-200">Upload customer data</Link>
        </div>
      </div>
      <div>
        <h2 className="mb-6 text-3xl font-bold">Why use ChurnGuard?</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(([title, text]) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-3 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-6 text-3xl font-bold">How it works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(([number, title, text]) => (
            <article key={number} className="rounded-xl bg-slate-100 p-6">
              <span className="text-3xl font-bold text-blue-700">{number}</span>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
