import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts'
import { getRiskLevel } from '../../utils/risk'

const RISK_TIERS = [
  { key: 'High', name: 'High Risk', color: '#B83838', bg: '#FAECEC', text: '#8C2A2A', badgeBg: 'bg-[#FAECEC] text-[#8C2A2A]' },
  { key: 'Medium', name: 'Medium Risk', color: '#E6B95F', bg: '#FAF2DF', text: '#8C6819', badgeBg: 'bg-[#FAF2DF] text-[#8C6819]' },
  { key: 'Low', name: 'Low Risk', color: '#43823C', bg: '#EAF5E9', text: '#2D5A27', badgeBg: 'bg-[#EAF5E9] text-[#2D5A27]' },
]

export default function RiskBreakdownChart({ customers = [], selectedFilter = 'All', onSelectFilter }) {
  // Interactive hover state for slice pop-out and reactive center hole
  const [hoveredKey, setHoveredKey] = useState(null)

  const { chartData, totalCount, counts } = useMemo(() => {
    const total = customers.length || 0
    const countsMap = { High: 0, Medium: 0, Low: 0 }

    customers.forEach((c) => {
      const risk = getRiskLevel(c.churn_probability)
      countsMap[risk] = (countsMap[risk] || 0) + 1
    })

    const data = RISK_TIERS.map((tier) => ({
      ...tier,
      value: countsMap[tier.key] || 0,
      percentage: total > 0 ? Number(((countsMap[tier.key] / total) * 100).toFixed(1)) : 0,
    })).filter((d) => d.value > 0)

    return { chartData: data, totalCount: total, counts: countsMap }
  }, [customers])

  // Active or hovered tier data for center label
  const activeFocusTier = useMemo(() => {
    const targetKey = hoveredKey || (selectedFilter !== 'All' ? selectedFilter : null)
    if (!targetKey) return null
    return chartData.find((d) => d.key === targetKey) || null
  }, [hoveredKey, selectedFilter, chartData])

  // Active slice index for Recharts activeShape pop-out
  const activeIndex = useMemo(() => {
    const targetKey = hoveredKey || (selectedFilter !== 'All' ? selectedFilter : null)
    if (!targetKey) return -1
    return chartData.findIndex((d) => d.key === targetKey)
  }, [hoveredKey, selectedFilter, chartData])

  // Custom pop-out active slice shape
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return (
      <g className="transition-all duration-300">
        {/* Main expanded slice */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 3}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#291C2E"
          strokeWidth={2.5}
        />
        {/* Halo outer accent ring */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 11}
          outerRadius={outerRadius + 13}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.5}
        />
      </g>
    )
  }

  return (
    <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm flex flex-col justify-between transition-all">
      <div>
        {/* Header with Title and Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBC69F]/40 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
                Customer Risk Breakdown
              </h3>
              <span className="rounded-full bg-[#FAF2DF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#8C6819] border border-[#EBC69F]/60">
                Segment Shares
              </span>
            </div>
            <p className="text-xs text-[#392D35] mt-0.5">
              Portfolio risk segment shares. Hover or click slices and pills to filter.
            </p>
          </div>

          {selectedFilter && selectedFilter !== 'All' && (
            <button
              type="button"
              onClick={() => onSelectFilter?.('All')}
              className="rounded-xl border border-[#EBC69F] bg-[#FAF2DF] px-3 py-1.5 text-xs font-bold text-[#8C6819] hover:bg-[#EBC69F] transition-all flex items-center gap-1 shadow-xs"
            >
              <span>Reset to All</span>
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>

        {/* Quick Segmented Toggle Bar */}
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-[#FAF2DF] p-1.5 border border-[#EBC69F]/60 shadow-xs mb-3">
          <button
            type="button"
            onClick={() => onSelectFilter?.('All')}
            className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2 text-xs transition-all ${
              selectedFilter === 'All'
                ? 'bg-[#494269] text-[#FFF3E4] shadow-sm font-bold scale-[1.02]'
                : 'text-[#494269] hover:bg-[#EBC69F]/40 font-medium'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">All</span>
            <span className="font-mono text-sm font-extrabold">{totalCount}</span>
          </button>

          {RISK_TIERS.map((tier) => {
            const count = counts[tier.key] || 0
            const isSelected = selectedFilter === tier.key
            return (
              <button
                key={tier.key}
                type="button"
                onMouseEnter={() => setHoveredKey(tier.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => onSelectFilter?.(isSelected ? 'All' : tier.key)}
                className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2 text-xs transition-all ${
                  isSelected
                    ? 'bg-[#291C2E] text-[#FFF3E4] shadow-sm font-bold scale-[1.02] ring-2 ring-[#E6B95F]'
                    : 'text-[#392D35] hover:bg-[#EBC69F]/40 font-medium'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span>{tier.key}</span>
                </div>
                <span className="font-mono text-sm font-extrabold" style={{ color: isSelected ? '#FFF3E4' : tier.color }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Doughnut Chart with Dynamically Reactive Center Hole */}
        <div className="relative my-3 h-56 w-full flex items-center justify-center">
          {totalCount > 0 && chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={86}
                    paddingAngle={5}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    className="cursor-pointer"
                    onMouseEnter={(_, index) => {
                      if (chartData[index]) {
                        setHoveredKey(chartData[index].key)
                      }
                    }}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={(entry) => {
                      if (entry && entry.key) {
                        onSelectFilter?.(selectedFilter === entry.key ? 'All' : entry.key)
                      }
                    }}
                  >
                    {chartData.map((entry) => {
                      const isSelected = selectedFilter === entry.key
                      const isHovered = hoveredKey === entry.key
                      const hasActiveFilter = selectedFilter !== 'All'

                      let opacity = 1
                      if (hasActiveFilter && !isSelected) {
                        opacity = isHovered ? 0.7 : 0.35
                      } else if (hoveredKey && !isHovered && !isSelected) {
                        opacity = 0.6
                      }

                      return (
                        <Cell
                          key={entry.key}
                          fill={entry.color}
                          opacity={opacity}
                          stroke={isSelected ? '#291C2E' : '#FFF3E4'}
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all duration-200"
                        />
                      )
                    })}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-2xl border border-[#E6B95F] bg-[#291C2E] p-3 text-xs text-[#FFF3E4] shadow-xl animate-fade-in">
                            <p className="font-bold text-[#E6B95F] flex items-center gap-1.5">
                              <span className="size-2 rounded-full" style={{ backgroundColor: data.color }} />
                              {data.name}
                            </p>
                            <p className="mt-1 font-mono text-sm font-extrabold">{data.value} accounts ({data.percentage}%)</p>
                            <p className="mt-1 text-[10px] text-[#A99BB9]">Click slice to filter cohort</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Reactive Centered Total Label in Doughnut Hole */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-200">
                {activeFocusTier ? (
                  <>
                    <span
                      className="font-mono text-2xl font-extrabold tracking-tight transition-all scale-105"
                      style={{ color: activeFocusTier.color }}
                    >
                      {activeFocusTier.value}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider mt-0.5"
                      style={{ color: activeFocusTier.color }}
                    >
                      {activeFocusTier.key} Risk
                    </span>
                    <span className="text-[10px] font-mono text-[#494269]/80 font-medium">
                      {activeFocusTier.percentage}% share
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-2xl font-extrabold text-[#291C2E]">
                      {totalCount}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#494269]/70 mt-0.5">
                      Total Accounts
                    </span>
                    <span className="text-[10px] font-mono text-[#A99BB9]">
                      100% active
                    </span>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#392D35]">
              No evaluated customers available.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend with Tactile Cards & Hover Highlight */}
      <div className="space-y-2 border-t border-[#EBC69F]/40 pt-4 text-xs">
        {RISK_TIERS.map((tier) => {
          const match = chartData.find((d) => d.key === tier.key)
          const count = match ? match.value : 0
          const pct = match ? match.percentage : 0
          const isSelected = selectedFilter === tier.key
          const isHovered = hoveredKey === tier.key

          return (
            <button
              key={tier.key}
              type="button"
              onMouseEnter={() => setHoveredKey(tier.key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => onSelectFilter?.(selectedFilter === tier.key ? 'All' : tier.key)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-[#291C2E] bg-[#FAF2DF] font-bold text-[#291C2E] shadow-xs scale-[1.02]'
                  : isHovered
                  ? 'border border-[#E6B95F] bg-[#FFF3E4] text-[#291C2E] shadow-xs scale-[1.01]'
                  : 'border border-[#EBC69F]/40 bg-white hover:bg-[#FFF3E4] text-[#392D35]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0 transition-transform"
                  style={{
                    backgroundColor: tier.color,
                    boxShadow: isSelected || isHovered ? `0 0 8px ${tier.color}` : 'none',
                  }}
                />
                <span className="font-semibold">{tier.name}</span>
                {isSelected && (
                  <span className="rounded-full bg-[#291C2E] px-1.5 py-0.2 text-[9px] font-bold text-[#FAF2DF]">
                    Active Filter
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 font-mono">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                    count > 0 ? tier.badgeBg : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {count}
                </span>
                <span className="text-[10px] text-[#A99BB9] font-semibold w-12 text-right">
                  {pct}%
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
