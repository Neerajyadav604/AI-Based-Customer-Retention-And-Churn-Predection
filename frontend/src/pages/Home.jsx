// Home.jsx - public landing page with no API calls.
import { useEffect, useState } from 'react'
import LaunchWorkspaceButton from '../components/LaunchWorkspaceButton'
import FeatureCards from '../components/home/FeatureCards'
import HomeCta from '../components/home/HomeCta'
import HowItWorks from '../components/home/HowItWorks'
import ProductPreview from '../components/home/ProductPreview'
import RetentionHighlight from '../components/home/RetentionHighlight'
import RiskOverview from '../components/home/RiskOverview'

// Show the public landing page.
export default function Home() {
  const headline = 'Retain customers with a clear next step.'
  const [typedHeadline, setTypedHeadline] = useState('')

  useEffect(() => {
    let index = 0
    let deleting = false
    let timer

    function typeNext() {
      if (!deleting) {
        index += 1
        setTypedHeadline(headline.slice(0, index))
        if (index === headline.length) {
          deleting = true
          timer = window.setTimeout(typeNext, 3000)
          return
        }
      } else {
        index -= 1
        setTypedHeadline(headline.slice(0, index))
        if (index === 0) deleting = false
      }
      timer = window.setTimeout(typeNext, deleting ? 85 : 110)
    }

    timer = window.setTimeout(typeNext, 110)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
        <section className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">AI-powered customer retention</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.025em] text-slate-900 sm:text-6xl">
            Predict customer churn before it happens.
            <span className="relative block text-indigo-600" aria-label={headline} aria-live="polite">
              <span className="invisible block" aria-hidden="true">{headline}</span>
              <span className="absolute inset-0">
                {typedHeadline}
                <span className="ml-1 inline-block h-[0.85em] border-r-2 border-indigo-500 align-[-0.08em] animate-pulse" aria-hidden="true" />
              </span>
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Upload your order list, get a churn risk for every customer, and follow clear actions to keep them.
          </p>
          <div className="mt-8 flex justify-center">
            <LaunchWorkspaceButton
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Launch workspace
            </LaunchWorkspaceButton>
          </div>
        </section>

        <ProductPreview />
        <div className="mt-28"><FeatureCards /></div>
        <div className="mt-28"><RiskOverview /></div>
        <div className="mt-28"><HowItWorks /></div>
        <div className="mt-28"><RetentionHighlight /></div>
        <div className="mt-28"><HomeCta /></div>
      </main>

    </div>
  )
}
