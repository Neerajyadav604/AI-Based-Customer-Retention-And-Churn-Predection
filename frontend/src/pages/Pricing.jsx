import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { upgrade } from '../lib/upgrade'

const monthly = {
  pro: { price: '499', suffix: '/month' },
  business: { price: '1,499', suffix: '/month' },
}

const yearly = {
  pro: { price: '399', suffix: '/month' },
  business: { price: '1,199', suffix: '/month' },
}

const faqs = [
  ['What counts as a trial?', 'One trial is one successful prediction: a single customer on Predict, or one CSV upload on Batch Upload.'],
  ['Can I cancel anytime?', 'Yes. Plans are billed monthly in this test-mode project. You can stop using the paid plan at any time.'],
  ['Which payment methods are supported?', 'Razorpay Checkout (test mode) accepts cards, UPI, and net banking with Razorpay test credentials.'],
  ['Is my customer data safe?', 'Uploads stay on your account for history and recommendations. Do not upload real customer files you are not allowed to use.'],
]

function Check({ className = 'text-indigo-600' }) {
  return (
    <svg viewBox="0 0 24 24" className={`mt-0.5 h-4 w-4 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  )
}

// Public pricing page. Checkout still uses monthly Razorpay test prices.
export default function Pricing() {
  const { user } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(0)
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const prices = billing === 'yearly' ? yearly : monthly

  async function handleUpgrade(plan) {
    setError('')
    setSuccess('')
    setLoadingPlan(plan)
    try {
      const result = await upgrade(plan)
      if (result) {
        setSuccess(`You are now on the ${result.plan} plan.`)
      }
    } catch (requestError) {
      if (requestError.message !== 'Payment cancelled') {
        setError(requestError.message)
      }
    } finally {
      setLoadingPlan('')
    }
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-[11px] font-medium text-indigo-600">
            Start with 3 free trials
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Simple pricing to keep your customers from leaving
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Try ChurnGuard with 3 free trials. No credit card needed. Upgrade seamlessly when you are ready to scale customer retention.
          </p>
          <p className="mt-4 text-sm font-medium text-indigo-700">
            Try it first: every new account gets 3 free trials.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex rounded-full bg-white p-1 text-sm shadow-sm ring-1 ring-slate-200">
            <button type="button" onClick={() => setBilling('monthly')} className={`rounded-full px-4 py-1.5 ${billing === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
              Monthly
            </button>
            <button type="button" onClick={() => setBilling('yearly')} className={`rounded-full px-4 py-1.5 ${billing === 'yearly' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
              Yearly <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Save 20%</span>
            </button>
          </div>
        </div>
        {billing === 'yearly' && (
          <p className="mt-3 text-center text-xs text-slate-500">Yearly prices are shown for comparison. Test checkout still charges the monthly amount.</p>
        )}

        {error && <p role="alert" className="mx-auto mt-6 max-w-xl rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="mx-auto mt-6 max-w-xl rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-800">{success}</p>}

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          <article className="relative rounded-2xl border-2 border-indigo-500 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Pro</p>
                <p className="mt-1 text-sm text-slate-500">Best for growing online sellers & DTC storefronts</p>
              </div>
              <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Most popular</span>
            </div>
            <p className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-semibold text-slate-900">₹{prices.pro.price}</span>
              <span className="mb-1 text-sm text-slate-500">{prices.pro.suffix}</span>
            </p>
            <p className="text-xs text-slate-400">Billed monthly, cancel anytime</p>
            <button type="button" disabled={!!loadingPlan} onClick={() => handleUpgrade('pro')} className="mt-6 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {loadingPlan === 'pro' ? 'Opening checkout...' : 'Upgrade to Pro →'}
            </button>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><Check />Up to 5,000 customers per batch upload</li>
              <li className="flex gap-2"><Check />All churn risk bands (High, Medium, Low)</li>
              <li className="flex gap-2"><Check />History and recommendations</li>
              <li className="flex gap-2"><Check />Automated win-back & discount recommendations</li>
              <li className="flex gap-2"><Check />Standard email support (24–48h SLA)</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Business</p>
                <p className="mt-1 text-sm text-slate-500">For established brands with large customer bases</p>
              </div>
              <Link to="/about" className="text-xs font-medium text-indigo-600">Case studies →</Link>
            </div>
            <p className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-semibold text-slate-900">₹{prices.business.price}</span>
              <span className="mb-1 text-sm text-slate-500">{prices.business.suffix}</span>
            </p>
            <p className="text-xs text-slate-400">Billed monthly, cancel anytime</p>
            <button type="button" disabled={!!loadingPlan} onClick={() => handleUpgrade('business')} className="mt-6 flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50">
              {loadingPlan === 'business' ? 'Opening checkout...' : 'Upgrade to Business →'}
            </button>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><Check className="text-slate-500" />Up to 50,000 customers per batch upload</li>
              <li className="flex gap-2"><Check className="text-slate-500" />Report download (CSV)</li>
              <li className="flex gap-2"><Check className="text-slate-500" />Priority support</li>
              <li className="flex gap-2"><Check className="text-slate-500" />Advanced segmentation columns & seasonality factor weights</li>
              <li className="flex gap-2"><Check className="text-slate-500" />Dedicated priority support via WhatsApp & direct phone</li>
            </ul>
          </article>
        </div>

        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">How trials work</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">How your 3 free trials work</h2>
            </div>
            <p className="text-xs text-slate-400">New accounts only. No credit card required.</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              ['1', 'Create account', 'Sign up. All accounts start with 3 trials. Existing users without a plan are treated the same way.'],
              ['2', 'Use 3 free trials', 'Upload order reports or run Predict. Each successful run uses 1 trial.'],
              ['3', 'Upgrade to continue', 'Switch to Pro or Business when the three trials are used, or if an upload is over 100 customers.'],
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">{step}</span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-indigo-600">Plan comparison</p>
          <h2 className="mt-1 text-center text-3xl font-semibold text-slate-900">Detailed Capability Matrix</h2>
          <p className="mt-2 text-center text-sm text-slate-500">Transparent breakdown of algorithms, data-retention, and deliverables.</p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Core capabilities</th>
                  <th className="px-5 py-4 font-medium">Pro</th>
                  <th className="px-5 py-4 font-medium">Business</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4">Customer batch capacity</td>
                  <td className="px-5 py-4 font-medium">5,000</td>
                  <td className="px-5 py-4 font-medium">50,000</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4">Historical prediction history</td>
                  <td className="px-5 py-4">30 days</td>
                  <td className="px-5 py-4 text-indigo-600">Unlimited</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4">Retention action playbook</td>
                  <td className="px-5 py-4 text-indigo-600">Included</td>
                  <td className="px-5 py-4 text-indigo-600">Included</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4">Downloadable reports</td>
                  <td className="px-5 py-4 text-slate-400">—</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">Included</span></td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4">Support SLA</td>
                  <td className="px-5 py-4">Email (24–48h)</td>
                  <td className="px-5 py-4">Priority WhatsApp & phone</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4">Risk segmentation fidelity</td>
                  <td className="px-5 py-4">Low / Medium / High</td>
                  <td className="px-5 py-4">Custom cohorts + drift alerts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-indigo-600">Insights</p>
          <h2 className="mt-1 text-center text-3xl font-semibold text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-2 text-center text-sm text-slate-500">Clear answers regarding trials, billing, and data handling.</p>
          <div className="mx-auto mt-8 max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map(([question, answer], index) => (
              <div key={question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-800">
                  {question}
                  <span className="text-slate-400">{openFaq === index ? '–' : '+'}</span>
                </button>
                {openFaq === index && <p className="px-5 pb-4 text-sm leading-6 text-slate-500">{answer}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-indigo-600 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to reduce churn and protect your store’s revenue?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-indigo-100">
            Join hundreds of e-commerce stores and kirana stores identifying at-risk customers before they defect.
          </p>
          <Link to={user ? '/workspace' : '/signup'} className="mt-8 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
            Launch Workspace →
          </Link>
          <p className="mt-4 text-xs text-indigo-200">No credit card required · Instant 3 free trials · Takes under 60 seconds</p>
        </div>
      </section>

      <footer className="border-t border-indigo-100 bg-[#eef0ff] px-4 py-6 text-xs text-slate-500 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-slate-800">ChurnGuard</p>
          <nav className="flex flex-wrap gap-4">
            <Link to="/about" className="hover:text-slate-900">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-900">Terms of Service</Link>
            <Link to="/docs" className="hover:text-slate-900">Documentation</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
