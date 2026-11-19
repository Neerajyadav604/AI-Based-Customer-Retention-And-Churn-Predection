import { useState } from 'react'
import { Link } from 'react-router-dom'
import LaunchWorkspaceButton from '../components/LaunchWorkspaceButton'
import { useAuth } from '../context/AuthContext'
import { upgrade } from '../lib/upgrade'
import { DoodleSparkle } from '../components/Doodles'

const monthly = {
  pro: { price: '499', suffix: '/month' },
  business: { price: '1,499', suffix: '/month' },
}

const yearly = {
  pro: { price: '399', suffix: '/month' },
  business: { price: '1,199', suffix: '/month' },
}

const faqs = [
  ['What counts as a trial prediction?', 'A single evaluation on the Predict page, or one CSV upload run on the Batch Upload console.'],
  ['Can I cancel anytime?', 'Yes. Plans are billed on test-mode Razorpay checkout and can be paused or changed at any time.'],
  ['Which payment options are supported?', 'Razorpay Checkout handles UPI, net banking, and debit/credit cards in test mode.'],
  ['Is customer transaction data secured?', 'Yes. Files are only used for your account cohort analytics and are never shared or resold.'],
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[#494269]" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

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
        setSuccess(`Successfully activated the ${result.plan} plan.`)
      }
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        setError(err.message)
      }
    } finally {
      setLoadingPlan('')
    }
  }

  return (
    <div className="py-12 sm:py-20 text-[#291C2E] px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#494269] mb-4">
          <DoodleSparkle size={14} className="text-[#E6B95F]" />
          <span>Fair & Transparent Pricing</span>
        </div>
        <h1 className="font-editorial text-4xl font-bold tracking-tight text-[#291C2E] sm:text-5xl">
          Retain valuable accounts for less than the cost of one lost order.
        </h1>
        <p className="mt-4 text-base text-[#392D35]">
          Start on our free trial tier with 3 full predictions. Upgrade whenever you are ready to scale batch inference.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 inline-flex items-center rounded-2xl bg-[#FFF8ED] p-1.5 border border-[#EBC69F]/80">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`rounded-xl px-5 py-2 text-xs font-bold transition ${
              billing === 'monthly'
                ? 'bg-[#494269] text-[#FFF3E4] shadow-sm'
                : 'text-[#494269] hover:text-[#291C2E]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={`rounded-xl px-5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              billing === 'yearly'
                ? 'bg-[#494269] text-[#FFF3E4] shadow-sm'
                : 'text-[#494269] hover:text-[#291C2E]'
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-full bg-[#E6B95F] px-2 py-0.5 text-[9px] text-[#291C2E] font-extrabold uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-[#FAECEC] p-4 text-center text-xs text-[#8C2A2A] border border-[#C87979]">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-[#EAF5E9] p-4 text-center text-xs text-[#2D5A27] border border-[#7EAA79]">
          {success}
        </div>
      )}

      {/* 3 Pricing Cards */}
      <div className="mt-14 grid gap-8 md:grid-cols-3 items-stretch max-w-6xl mx-auto">
        {/* Tier 1: Free Trial */}
        <div className="rounded-3xl border-2 border-[#EBC69F]/80 bg-white p-8 flex flex-col justify-between shadow-sm card-hover-lift">
          <div>
            <span className="rounded-full bg-[#FFF8ED] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#494269] border border-[#EBC69F]">
              Free Starter
            </span>
            <h3 className="mt-4 font-editorial text-2xl font-bold text-[#291C2E]">Explorer Trial</h3>
            <p className="mt-2 text-xs text-[#392D35]">Test model accuracy and understand RFM features.</p>
            <div className="my-6">
              <span className="font-editorial text-5xl font-bold text-[#291C2E]">₹0</span>
              <span className="text-xs text-[#392D35]"> / forever</span>
            </div>
            <ul className="space-y-3 text-xs text-[#291C2E] border-t border-[#EBC69F]/40 pt-5">
              <li className="flex items-center gap-2"><CheckIcon /> 3 Trial prediction runs</li>
              <li className="flex items-center gap-2"><CheckIcon /> Single customer scoring</li>
              <li className="flex items-center gap-2"><CheckIcon /> Basic feature importance chart</li>
              <li className="flex items-center gap-2"><CheckIcon /> Sample dataset access</li>
            </ul>
          </div>
          <Link
            to="/signup"
            className="mt-8 block w-full rounded-2xl border-1.5 border-[#494269] bg-[#FFF8ED] py-3 text-center text-xs font-bold text-[#494269] hover:bg-[#EBC69F] transition"
          >
            Start Free
          </Link>
        </div>

        {/* Tier 2: Pro (Highlighted) */}
        <div className="relative rounded-3xl border-2 border-[#E6B95F] bg-[#494269] p-8 text-[#FFF3E4] flex flex-col justify-between shadow-xl card-hover-lift">
          <div className="absolute -top-3.5 right-6 rounded-full bg-[#E6B95F] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#291C2E] shadow-sm">
            Most Popular
          </div>
          <div>
            <span className="rounded-full bg-[#373152] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E6B95F] border border-[#A99BB9]/30">
              Retail Growth
            </span>
            <h3 className="mt-4 font-editorial text-2xl font-bold text-[#FFF3E4]">Pro Retention</h3>
            <p className="mt-2 text-xs text-[#F4D3B5]/80">For active shops, growing sellers, and e-commerce stores.</p>
            <div className="my-6">
              <span className="font-editorial text-5xl font-bold text-[#FFF3E4]">₹{prices.pro.price}</span>
              <span className="text-xs text-[#F4D3B5]/80"> {prices.pro.suffix}</span>
            </div>
            <ul className="space-y-3 text-xs text-[#F4D3B5] border-t border-[#373152] pt-5">
              <li className="flex items-center gap-2"><span className="text-[#E6B95F]">✓</span> <strong>Unlimited</strong> CSV batch uploads</li>
              <li className="flex items-center gap-2"><span className="text-[#E6B95F]">✓</span> Full exportable customer risk sheets</li>
              <li className="flex items-center gap-2"><span className="text-[#E6B95F]">✓</span> Complete confusion matrix diagnostics</li>
              <li className="flex items-center gap-2"><span className="text-[#E6B95F]">✓</span> Actionable retention playbook suggestions</li>
              <li className="flex items-center gap-2"><span className="text-[#E6B95F]">✓</span> Email & WhatsApp campaign export</li>
            </ul>
          </div>
          <button
            type="button"
            disabled={loadingPlan === 'pro'}
            onClick={() => handleUpgrade('pro')}
            className="mt-8 block w-full rounded-2xl bg-[#E6B95F] py-3 text-center text-xs font-bold text-[#291C2E] shadow-md hover:bg-[#D6A34E] transition btn-interactive"
          >
            {loadingPlan === 'pro' ? 'Opening Razorpay Checkout...' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Tier 3: Business */}
        <div className="rounded-3xl border-2 border-[#EBC69F]/80 bg-white p-8 flex flex-col justify-between shadow-sm card-hover-lift">
          <div>
            <span className="rounded-full bg-[#FFF8ED] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#494269] border border-[#EBC69F]">
              Enterprise Volume
            </span>
            <h3 className="mt-4 font-editorial text-2xl font-bold text-[#291C2E]">Business Scale</h3>
            <p className="mt-2 text-xs text-[#392D35]">For larger operations with multi-account teams.</p>
            <div className="my-6">
              <span className="font-editorial text-5xl font-bold text-[#291C2E]">₹{prices.business.price}</span>
              <span className="text-xs text-[#392D35]"> {prices.business.suffix}</span>
            </div>
            <ul className="space-y-3 text-xs text-[#291C2E] border-t border-[#EBC69F]/40 pt-5">
              <li className="flex items-center gap-2"><CheckIcon /> Everything in Pro</li>
              <li className="flex items-center gap-2"><CheckIcon /> 50,000+ transaction rows per upload</li>
              <li className="flex items-center gap-2"><CheckIcon /> Custom model retraining pipeline</li>
              <li className="flex items-center gap-2"><CheckIcon /> Dedicated priority support</li>
            </ul>
          </div>
          <button
            type="button"
            disabled={loadingPlan === 'business'}
            onClick={() => handleUpgrade('business')}
            className="mt-8 block w-full rounded-2xl border-1.5 border-[#494269] bg-[#FFF8ED] py-3 text-center text-xs font-bold text-[#494269] hover:bg-[#EBC69F] transition"
          >
            {loadingPlan === 'business' ? 'Opening Razorpay...' : 'Upgrade to Business'}
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="font-editorial text-3xl font-bold text-center text-[#291C2E] mb-8">
          Frequently Answered Questions
        </h2>
        <div className="divide-y divide-[#EBC69F]/50 rounded-3xl border border-[#EBC69F] bg-white overflow-hidden shadow-xs">
          {faqs.map(([q, a], idx) => (
            <div key={q} className="p-6">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="flex w-full items-center justify-between text-left font-editorial text-lg font-bold text-[#291C2E]"
              >
                <span>{q}</span>
                <span className="text-[#E6B95F] font-mono text-xl">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <p className="mt-3 text-xs leading-relaxed text-[#392D35]">{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
