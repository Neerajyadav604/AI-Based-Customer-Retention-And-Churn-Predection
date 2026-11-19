import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LaunchWorkspaceButton from '../components/LaunchWorkspaceButton'
import FeatureCards from '../components/home/FeatureCards'
import HomeCta from '../components/home/HomeCta'
import HowItWorks from '../components/home/HowItWorks'
import ProductPreview from '../components/home/ProductPreview'
import RetentionHighlight from '../components/home/RetentionHighlight'
import RiskOverview from '../components/home/RiskOverview'
import { DoodleSparkle, DoodleUnderline, DoodleCircle, DoodleArrow } from '../components/Doodles'

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
          timer = window.setTimeout(typeNext, 2800)
          return
        }
      } else {
        index -= 1
        setTypedHeadline(headline.slice(0, index))
        if (index === 0) deleting = false
      }
      timer = window.setTimeout(typeNext, deleting ? 60 : 90)
    }

    timer = window.setTimeout(typeNext, 90)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="relative overflow-hidden text-[#291C2E]">
      {/* Decorative Warm Auras */}
      <div
        className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-[#EBC69F]/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-32 size-80 rounded-full bg-[#A99BB9]/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 text-center sm:pt-14 sm:pb-24">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#291C2E] shadow-xs mb-6">
          <DoodleSparkle size={15} className="text-[#E6B95F]" />
          <span>AI-Powered Customer Retention</span>
          <span className="size-1.5 rounded-full bg-[#E6B95F]" />
          <span className="text-[#392D35] lowercase">predictive model</span>
        </div>

        {/* Expressive Editorial Headline */}
        <h1 className="mx-auto max-w-4xl font-editorial text-4xl font-bold leading-[1.12] tracking-tight text-[#291C2E] sm:text-6xl md:text-7xl">
          Predict customer churn{' '}
          <span className="relative inline-block text-[#373152]">
            before
            <DoodleUnderline className="absolute -bottom-2.5 left-0 text-[#E6B95F]" />
          </span>{' '}
          it happens.
          <span
            className="mt-3 block font-editorial text-3xl font-medium text-[#373152] sm:text-4xl md:text-5xl"
            aria-label={headline}
          >
            {typedHeadline}
            <span
              className="ml-1 inline-block h-[0.85em] w-0.5 bg-[#E6B95F] align-[-0.05em] animate-pulse"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#392D35] sm:text-lg">
          Upload your order history, get instantaneous risk assessments for every customer, and follow actionable retention strategies before revenue is lost.
        </p>

        {/* CTA Button Row with Hand-drawn Doodle Note */}
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
          <LaunchWorkspaceButton className="rounded-2xl bg-gradient-to-r from-[#F3C66F] via-[#E6B95F] to-[#D6A34E] text-[#291C2E] px-7 py-3.5 text-base font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all btn-interactive">
            Launch Retention Workspace →
          </LaunchWorkspaceButton>
          <Link
            to="/workspace/predict"
            className="rounded-2xl border-1.5 border-[#291C2E] bg-[#FFF8ED] px-6 py-3.5 text-base font-semibold text-[#291C2E] hover:bg-[#EBC69F]/40 hover:-translate-y-0.5 transition-all"
          >
            Test Single Customer
          </Link>

          {/* Playful doodle pointer note */}
          <div className="hidden lg:flex absolute left-[72%] top-2 items-center gap-2 text-left">
            <DoodleArrow className="text-[#E6B95F] rotate-12" />
            <span className="font-editorial italic text-xs text-[#392D35] max-w-[120px] leading-tight">
              3 free trial predictions included!
            </span>
          </div>
        </div>

        {/* High-fidelity interactive preview */}
        <div className="mt-14">
          <ProductPreview />
        </div>
      </section>

      {/* Feature section cards */}
      <section className="py-12 border-t border-[#EBC69F]/50">
        <FeatureCards />
      </section>

      {/* How it works workflow */}
      <section className="py-16">
        <HowItWorks />
      </section>

      {/* Risk Overview & Insights breakdown */}
      <section className="py-16">
        <RiskOverview />
      </section>

      {/* Deep Dive Telemetry & Actions */}
      <section className="py-16">
        <RetentionHighlight />
      </section>

      {/* Final Call to Action */}
      <section className="py-16">
        <HomeCta />
      </section>
    </div>
  )
}