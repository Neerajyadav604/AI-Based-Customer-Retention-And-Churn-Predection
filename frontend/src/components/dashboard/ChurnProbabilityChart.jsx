import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList,
} from 'recharts'
import { normalizeProbability } from '../../utils/risk'

const BUCKETS = [
  { key: '0-20', label: '0–20%', name: 'Very Low', color: '#43823C', min: 0, max: 20 },
  { key: '21-40', label: '21–40%', name: 'Low', color: '#68A860', min: 20.001, max: 40 },
  { key: '41-60', label: '41–60%', name: 'Moderate', color: '#E6B95F', min: 40.001, max: 60 },
  { key: '61-80', label: '61–80%', name: 'High', color: '#DC5A5A', min: 60.001, max: 80 },
  { key: '81-100', label: '81–100%', name: 'Critical', color: '#A82828', min: 80.001, max: 100 },
]

export default function ChurnProbabilityChart({ customers = [], selectedRange, onSelectRange }) {
  // Toggle between count (#) and percentage (%) view
  const [metricMode, setMetricMode] = useState('count')
  // Hover state for interactive highlighting between legend, bars, and tooltips
  const [hoveredKey, setHoveredKey] = useState(null)

  const chartData = useMemo(() => {
    const total = customers.length || 1

    return BUCKETS.map((bucket) => {
      const matching = customers.filter((c) => {
        const p = normalizeProbability(c.churn_probability)
        return p >= bucket.min && p <= bucket.max
      })
      const count = matching.length
      const percentage = Number(((count / total) * 100).toFixed(1))

      return {
        ...bucket,
        count,
        percentage,
        customers: matching,
      }
    })
  }, [customers])

  // Active bucket details when filtered
  const activeBucket = useMemo(() => {
    if (!selectedRange) return null
    return chartData.find((b) => b.key === selectedRange) || null
  }, [chartData, selectedRange])

  // Dynamic explanation from real statistics
  const dynamicInsight = useMemo(() => {
    if (!customers || customers.length === 0) {
      return 'No evaluated customer records yet. Upload orders data to generate live churn probability distributions.'
    }

    const total = customers.length
    const dominant = [...chartData].sort((a, b) => b.count - a.count)[0]
    const highCriticalCount = chartData
      .filter((b) => b.key === '61-80' || b.key === '81-100')
      .reduce((acc, b) => acc + b.count, 0)
    const highCriticalPct = ((highCriticalCount / total) * 100).toFixed(0)

    if (dominant && dominant.count === total) {
      return `All ${total} evaluated customers currently fall within the ${dominant.label} (${dominant.name}) probability range.`
    }

    if (highCriticalCount > 0) {
      return `${dominant.percentage}% of evaluated accounts fall within the ${dominant.name} (${dominant.label}) range, while ${highCriticalCount} customer${highCriticalCount > 1 ? 's' : ''} (${highCriticalPct}%) require immediate attention in higher-risk bands.`
    }

    return `Most evaluated accounts (${dominant.percentage}%) currently fall within the ${dominant.name} (${dominant.label}) range. Customer trajectories remain balanced within safe-to-moderate thresholds.`
  }, [customers, chartData])

  const maxCount = useMemo(() => {
    const m = Math.max(...chartData.map((d) => (metricMode === 'count' ? d.count : d.percentage)), 0)
    return metricMode === 'count' ? Math.max(m + 1, 4) : Math.min(Math.ceil(m * 1.25), 100)
  }, [chartData, metricMode])

  return (
    <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm flex flex-col justify-between transition-all">
      <div>
        {/* Header with Title and Mode Toggle Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBC69F]/40 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
                Customer Churn Probability Distribution
              </h3>
              <span className="rounded-full bg-[#FAF2DF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#8C6819] border border-[#EBC69F]/60">
                5 Bands
              </span>
            </div>
            <p className="text-xs text-[#392D35] mt-0.5">
              Customer breakdown across 5 calibrated probability bands. Click any bar or legend pill to filter.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Toggle Switch: Count vs Percentage */}
            <div className="inline-flex rounded-xl bg-[#FAF2DF] p-1 border border-[#EBC69F]/60 shadow-xs">
              <button
                type="button"
                onClick={() => setMetricMode('count')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  metricMode === 'count'
                    ? 'bg-[#494269] text-[#FFF3E4] shadow-sm'
                    : 'text-[#494269] hover:bg-[#EBC69F]/40'
                }`}
                title="View customer count on Y-axis"
              >
                Accounts (#)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('percent')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  metricMode === 'percent'
                    ? 'bg-[#494269] text-[#FFF3E4] shadow-sm'
                    : 'text-[#494269] hover:bg-[#EBC69F]/40'
                }`}
                title="View customer percentage on Y-axis"
              >
                Share (%)
              </button>
            </div>

            {selectedRange && (
              <button
                type="button"
                onClick={() => onSelectRange?.(null)}
                className="rounded-xl border border-[#EBC69F] bg-[#FAF2DF] px-3 py-1.5 text-xs font-bold text-[#8C6819] hover:bg-[#EBC69F] transition-all flex items-center gap-1 shadow-xs"
              >
                <span>Reset</span>
                <span className="text-xs">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Banner */}
        {activeBucket && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#E6B95F] bg-[#FAF2DF]/90 px-4 py-2.5 text-xs text-[#291C2E] shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-full animate-ping" style={{ backgroundColor: activeBucket.color }} />
              <span>
                Filtered by Band: <strong>{activeBucket.label} ({activeBucket.name})</strong> —{' '}
                <span className="font-mono font-bold text-[#291C2E]">
                  {activeBucket.count} account{activeBucket.count !== 1 ? 's' : ''} ({activeBucket.percentage}%)
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectRange?.(null)}
              className="font-bold text-[#8C6819] hover:text-[#291C2E] underline transition-colors"
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        {/* Recharts Bar Chart */}
        <div className="h-64 w-full">
          {customers.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 22, right: 12, left: -10, bottom: 5 }}
                onMouseMove={(state) => {
                  if (state && state.activePayload && state.activePayload[0]) {
                    setHoveredKey(state.activePayload[0].payload.key)
                  }
                }}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const clickedKey = e.activePayload[0].payload.key
                    onSelectRange?.(selectedRange === clickedKey ? null : clickedKey)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFF8ED" />
                <XAxis
                  dataKey="label"
                  stroke="#494269"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#EBC69F', strokeWidth: 1 }}
                />
                <YAxis
                  stroke="#494269"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#EBC69F', strokeWidth: 1 }}
                  allowDecimals={false}
                  domain={[0, maxCount]}
                  unit={metricMode === 'percent' ? '%' : ''}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(235, 198, 159, 0.25)', radius: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const sampleIds = (data.customers || [])
                        .slice(0, 4)
                        .map((c) => `#${c.customer_id}`)
                        .join(', ')
                      const remaining = (data.customers?.length || 0) - 4

                      return (
                        <div className="rounded-2xl border border-[#E6B95F] bg-[#291C2E] p-3.5 text-xs text-[#FFF3E4] shadow-2xl min-w-[210px] animate-fade-in">
                          <div className="flex items-center justify-between gap-2 border-b border-[#FAF2DF]/20 pb-1.5 mb-2">
                            <span className="font-bold text-[#E6B95F] flex items-center gap-1.5">
                              <span className="size-2 rounded-full" style={{ backgroundColor: data.color }} />
                              {data.name} Risk
                            </span>
                            <span className="font-mono text-[10px] text-[#A99BB9]">{data.label}</span>
                          </div>
                          <p className="font-mono text-base font-extrabold text-[#FFF3E4]">
                            {data.count} <span className="text-xs font-normal text-[#A99BB9]">account{data.count !== 1 ? 's' : ''} ({data.percentage}%)</span>
                          </p>

                          {data.count > 0 && sampleIds && (
                            <p className="mt-2 text-[10px] text-[#C8BFDB] truncate">
                              <span className="font-semibold text-[#E6B95F]">Accounts:</span> {sampleIds}
                              {remaining > 0 ? ` +${remaining} more` : ''}
                            </p>
                          )}

                          <div className="mt-2.5 rounded-lg bg-[#373152] px-2 py-1 text-center text-[10px] font-semibold text-[#E6B95F]">
                            {selectedRange === data.key ? '✓ Filter Active (Click to reset)' : '👆 Click bar to filter cohort table'}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />

                <Bar
                  dataKey={metricMode === 'count' ? 'count' : 'percentage'}
                  radius={[8, 8, 2, 2]}
                  className="cursor-pointer transition-all duration-300"
                  animationDuration={600}
                >
                  <LabelList
                    dataKey={metricMode === 'count' ? 'count' : 'percentage'}
                    position="top"
                    formatter={(val) => {
                      if (!val || val === 0) return ''
                      return metricMode === 'count' ? `${val}` : `${val}%`
                    }}
                    fill="#291C2E"
                    fontSize={11}
                    fontWeight={700}
                    offset={6}
                  />

                  {chartData.map((entry) => {
                    const isSelected = selectedRange === entry.key
                    const isHovered = hoveredKey === entry.key
                    const hasActiveFilter = selectedRange !== null && selectedRange !== undefined

                    let opacity = 1
                    if (hasActiveFilter && !isSelected) {
                      opacity = isHovered ? 0.65 : 0.3
                    } else if (hoveredKey && !isHovered && !isSelected) {
                      opacity = 0.6
                    }

                    return (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        opacity={opacity}
                        stroke={isSelected ? '#291C2E' : isHovered ? '#E6B95F' : 'none'}
                        strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
                        className="transition-all duration-200"
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#392D35]">
              No customer data recorded yet.
            </div>
          )}
        </div>

        {/* Interactive Legend with Tactile Pill Toggles */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {BUCKETS.map((b) => {
            const match = chartData.find((d) => d.key === b.key)
            const count = match ? match.count : 0
            const pct = match ? match.percentage : 0
            const isSelected = selectedRange === b.key
            const isHovered = hoveredKey === b.key

            return (
              <button
                key={b.key}
                type="button"
                onMouseEnter={() => setHoveredKey(b.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => onSelectRange?.(selectedRange === b.key ? null : b.key)}
                className={`group flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs transition-all ${
                  isSelected
                    ? 'border-2 border-[#291C2E] bg-[#FAF2DF] font-bold text-[#291C2E] shadow-xs scale-105'
                    : isHovered
                    ? 'border border-[#E6B95F] bg-[#FFF3E4] text-[#291C2E] shadow-xs scale-102'
                    : 'border border-[#EBC69F]/50 bg-white text-[#392D35] hover:border-[#EBC69F] hover:bg-[#FFF3E4]'
                }`}
                title={`Click to filter by ${b.label} (${b.name})`}
              >
                <span
                  className="size-2.5 rounded-sm shrink-0 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: b.color }}
                />
                <span className="font-medium">{b.label}</span>
                <span className="text-[10px] text-[#A99BB9]">({b.name})</span>
                <span
                  className={`ml-1 rounded-md px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                    count > 0 ? 'bg-[#FAF2DF] text-[#8C6819]' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {metricMode === 'count' ? count : `${pct}%`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dynamic AI Explanation */}
      <div className="mt-5 rounded-2xl border border-[#EBC69F]/80 bg-[#FAF2DF]/70 p-4 text-xs text-[#291C2E]">
        <div className="flex items-center gap-1.5 font-bold text-[#8C6819] mb-1">
          <span className="text-sm">✦</span>
          <span className="uppercase tracking-wider text-[10px]">AI Distribution Analysis</span>
        </div>
        <p className="leading-relaxed text-[#392D35]">
          {dynamicInsight}
        </p>
      </div>
    </div>
  )
}
