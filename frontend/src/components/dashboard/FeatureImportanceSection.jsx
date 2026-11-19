import { useEffect, useState } from 'react'
import { getInsights } from '../../api'

const FEATURE_METADATA = {
  frequency: {
    label: 'Purchase Frequency',
    impact: 'High Impact',
    direction: 'Decreases Risk',
    color: '#43823C',
    isPositiveShield: true,
    description: 'Customers with frequent repeat purchases establish strong buying habits and are significantly less likely to defect.',
  },
  recency_days: {
    label: 'Recency Gap (Days Inactive)',
    impact: 'High Impact',
    direction: 'Increases Risk',
    color: '#B83838',
    isPositiveShield: false,
    description: 'Long gaps since the last order strongly indicate customer cooling or migration to competitors.',
  },
  avg_order_value: {
    label: 'Average Order Value (AOV)',
    impact: 'Medium Impact',
    direction: 'Decreases Risk',
    color: '#43823C',
    isPositiveShield: true,
    description: 'Higher basket spending correlates with higher customer commitment and lower churn sensitivity.',
  },
  monetary: {
    label: 'Total Monetary Value',
    impact: 'Medium Impact',
    direction: 'Volume Influence',
    color: '#E6B95F',
    isPositiveShield: false,
    description: 'Cumulative lifetime revenue, adjusted against purchase count to differentiate volume buyers.',
  },
  total_items: {
    label: 'Total Items Purchased',
    impact: 'Moderate Impact',
    direction: 'Decreases Risk',
    color: '#43823C',
    isPositiveShield: true,
    description: 'Customers who buy multiple items per checkout display higher cross-category product adoption.',
  },
  tenure_days: {
    label: 'Account Tenure (Days)',
    impact: 'Baseline Factor',
    direction: 'Relationship Age',
    color: '#8C6819',
    isPositiveShield: false,
    description: 'Total lifespan of customer account since their very first registered transaction.',
  },
}

export default function FeatureImportanceSection() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getInsights()
        setInsights(data)
      } catch (e) {
        console.warn('Could not load insights:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const featureWeights = insights?.feature_importance || [
    { feature: 'frequency', value: -1.472 },
    { feature: 'monetary', value: 0.691 },
    { feature: 'avg_order_value', value: -0.446 },
    { feature: 'total_items', value: -0.268 },
    { feature: 'tenure_days', value: 0.167 },
    { feature: 'recency_days', value: 0.088 },
  ]

  return (
    <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBC69F]/40 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
              Why Are Customers at Risk?
            </h3>
            <span className="rounded-full bg-[#FAF2DF] px-2.5 py-0.5 text-[10px] font-bold text-[#8C6819] border border-[#E6B95F]/40">
              Global Model Weights
            </span>
          </div>
          <p className="text-xs text-[#392D35] mt-0.5">
            Key behavioral signals calibrated by the trained Logistic Regression pipeline to differentiate churners from loyalists.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Interactive Feature Impact Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {featureWeights.map((item) => {
            const meta = FEATURE_METADATA[item.feature] || {
              label: item.feature,
              impact: 'Feature Factor',
              direction: item.value < 0 ? 'Decreases Risk' : 'Increases Risk',
              color: item.value < 0 ? '#43823C' : '#B83838',
              description: 'Behavioral predictor contributing to the cumulative model log-odds calculation.',
            }

            const isProtective = item.value < 0

            return (
              <div
                key={item.feature}
                className="rounded-2xl border border-[#EBC69F]/70 bg-[#FFF3E4] p-4 shadow-2xs transition hover:border-[#494269]/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid size-6 place-items-center rounded-lg text-xs font-bold text-white ${
                        isProtective ? 'bg-[#43823C]' : 'bg-[#B83838]'
                      }`}
                    >
                      {isProtective ? '▼' : '▲'}
                    </span>
                    <h4 className="font-editorial text-base font-bold text-[#291C2E]">
                      {meta.label}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#494269]/70">
                      {meta.impact}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isProtective ? 'bg-[#EAF5E9] text-[#2D5A27]' : 'bg-[#FAECEC] text-[#8C2A2A]'
                      }`}
                    >
                      {meta.direction}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#392D35] leading-relaxed">
                  {meta.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Right: Normalized Relative SHAP / Coefficient Importance Visualizer */}
        <div className="lg:col-span-5 rounded-2xl border border-[#EBC69F] bg-[#FAF2DF]/40 p-5">
          <h4 className="font-editorial text-lg font-bold text-[#291C2E] mb-1">
            Relative Signal Magnitude
          </h4>
          <p className="text-xs text-[#392D35] mb-5">
            Normalized weights applied to each customer feature vector before probability sigmoid scaling.
          </p>

          <div className="space-y-4">
            {featureWeights.map((item) => {
              const meta = FEATURE_METADATA[item.feature] || { label: item.feature }
              const absVal = Math.abs(item.value)
              const maxVal = 1.6
              const pct = Math.min(100, Math.round((absVal / maxVal) * 100))
              const isProtective = item.value < 0

              return (
                <div key={item.feature} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#291C2E] font-sans font-medium text-[11px]">{meta.label}</span>
                    <span className={isProtective ? 'text-[#43823C] font-bold' : 'text-[#B83838] font-bold'}>
                      {item.value > 0 ? `+${item.value}` : item.value}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white overflow-hidden border border-[#EBC69F]/50">
                    <div
                      className={`h-full rounded-full ${isProtective ? 'bg-[#43823C]' : 'bg-[#B83838]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-xl bg-white p-3.5 border border-[#EBC69F]/60 text-[11px] text-[#392D35]">
            <p className="font-bold text-[#494269] mb-0.5">ℹ Model Scope</p>
            This chart reflects global pipeline coefficients across all cohort evaluations. Select any customer in the table below to see their specific individual contribution breakdown.
          </div>
        </div>
      </div>
    </div>
  )
}

