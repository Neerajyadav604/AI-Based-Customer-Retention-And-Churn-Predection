import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'

const TIMEFRAMES = ['30D', '90D', '6M', '1Y']

const TREND_DATA = {
  '30D': [
    { period: 'Week 1', rate: 29.4, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Week 2', rate: 28.1, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Week 3', rate: 27.5, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Week 4', rate: 26.8, forecast: 26.8, ciLow: 25.1, ciHigh: 28.5 },
    { period: 'Next Wk', rate: null, forecast: 25.9, ciLow: 24.2, ciHigh: 27.8 },
  ],
  '90D': [
    { period: 'June', rate: 31.8, forecast: null, ciLow: null, ciHigh: null },
    { period: 'July', rate: 29.5, forecast: null, ciLow: null, ciHigh: null },
    { period: 'August', rate: 28.2, forecast: null, ciLow: null, ciHigh: null },
    { period: 'September', rate: 26.9, forecast: 26.9, ciLow: 25.2, ciHigh: 28.6 },
    { period: 'Q4 Est.', rate: null, forecast: 24.8, ciLow: 23.1, ciHigh: 26.7 },
  ],
  '6M': [
    { period: 'May', rate: 34.2, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Jun', rate: 31.8, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Jul', rate: 29.5, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Aug', rate: 28.2, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Sep', rate: 26.9, forecast: 26.9, ciLow: 25.2, ciHigh: 28.6 },
    { period: 'Oct Est.', rate: null, forecast: 24.8, ciLow: 23.0, ciHigh: 26.8 },
  ],
  '1Y': [
    { period: 'Q1', rate: 36.5, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Q2', rate: 32.1, forecast: null, ciLow: null, ciHigh: null },
    { period: 'Q3', rate: 28.2, forecast: 28.2, ciLow: 26.4, ciHigh: 30.0 },
    { period: 'Q4 Proj.', rate: null, forecast: 24.5, ciLow: 22.8, ciHigh: 26.5 },
  ],
}

export default function ChurnTrendChart({ avgProbability = 27.3 }) {
  const [timeframe, setTimeframe] = useState('90D')

  const chartData = useMemo(() => {
    const raw = TREND_DATA[timeframe] || TREND_DATA['90D']
    // Calibrate recent data point around the live cohort average probability
    return raw.map((item, idx) => {
      if (item.rate !== null && idx === raw.length - 2) {
        return {
          ...item,
          rate: Number(avgProbability) || item.rate,
          forecast: Number(avgProbability) || item.forecast,
        }
      }
      return item
    })
  }, [timeframe, avgProbability])

  return (
    <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm flex flex-col justify-between transition-all">
      <div>
        {/* Header with Title and Timeframe Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBC69F]/40 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
                Churn Trends & Historical Comparison
              </h3>
              <span className="rounded-full bg-[#EAF5E9] border border-[#7EAA79]/50 px-2 py-0.5 text-[10px] font-bold text-[#2D5A27]">
                Trajectory
              </span>
            </div>
            <p className="text-xs text-[#392D35] mt-0.5">
              Empirical churn trajectory vs ML confidence intervals across consecutive billing cycles.
            </p>
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center rounded-xl bg-[#FAF2DF] p-1 border border-[#EBC69F]/60 shadow-xs">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#494269] text-[#FFF3E4] shadow-sm font-bold'
                    : 'text-[#494269] hover:bg-[#EBC69F]/40'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="mb-3 flex flex-wrap items-center justify-between text-xs text-[#392D35]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2.5 rounded-full bg-[#494269]" />
              Historical Churn Rate
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2.5 rounded-full bg-[#E6B95F]" />
              Model Prediction Envelope
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#8C6819]">
            Target Benchmark: &lt;18.0% (Δ -3.2%)
          </span>
        </div>

        {/* Chart Area */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#494269" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#494269" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E6B95F" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E6B95F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFF8ED" />
              <XAxis
                dataKey="period"
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
                domain={[10, 45]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="rounded-2xl border border-[#E6B95F] bg-[#291C2E] p-3 text-xs text-[#FFF3E4] shadow-xl">
                        <p className="font-bold text-[#E6B95F]">{d.period}</p>
                        {d.rate !== null && (
                          <p className="mt-1 font-mono font-bold text-sm">
                            Actual Churn: <span className="text-[#FFF3E4]">{d.rate}%</span>
                          </p>
                        )}
                        {d.forecast !== null && (
                          <p className="mt-1 font-mono text-xs text-[#E6B95F]">
                            ML Forecast: {d.forecast}%
                            {d.ciLow && ` (95% CI: ${d.ciLow}% - ${d.ciHigh}%)`}
                          </p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Area
                type="monotone"
                dataKey="rate"
                stroke="#494269"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#trendGradient)"
                activeDot={{ r: 6, fill: '#E6B95F', stroke: '#291C2E', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#E6B95F"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#forecastGradient)"
                activeDot={{ r: 5, fill: '#E6B95F' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistical Insight Bar */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#7EAA79]/40 bg-[#EAF5E9]/60 px-4 py-2.5 text-xs text-[#2D5A27]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">✓</span>
          <span>Historical downward curve matches cohort retention stabilization.</span>
        </div>
        <span className="font-mono text-[11px] font-bold text-[#494269]">
          95% CI: [22.4% – 31.8%]
        </span>
      </div>
    </div>
  )
}

