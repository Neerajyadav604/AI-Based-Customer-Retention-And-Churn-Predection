import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from './Card'
import { DoodleSparkle } from './Doodles'

function sortFeatures(features) {
  return [...features].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
}

export default function FeatureChart({ features }) {
  const sortedFeatures = sortFeatures(features || [])

  return (
    <Card className="rounded-3xl border-[#EBC69F]">
      <div className="flex items-center justify-between border-b border-[#EBC69F]/50 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">
              Feature Importance & Drivers
            </h2>
            <DoodleSparkle size={18} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1 text-xs text-[#392D35]">
            Model weights indicating how much each behavioral attribute pushes churn risk up or down.
          </p>
        </div>
        <span className="rounded-full bg-[#FFF8ED] px-3 py-1 text-xs font-semibold text-[#494269] border border-[#EBC69F]">
          Logistic Regression
        </span>
      </div>

      {sortedFeatures.length === 0 ? (
        <p className="p-8 text-center text-sm text-[#392D35]">
          No feature importance data available.
        </p>
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedFeatures} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" stroke="#A99BB9" tick={{ fill: '#392D35', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="feature"
                width={150}
                stroke="#A99BB9"
                tick={{ fill: '#291C2E', fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#494269',
                  borderRadius: '12px',
                  border: '1px solid #E6B95F',
                  color: '#FFF3E4',
                  boxShadow: '0 8px 24px rgba(41,38,56,0.2)',
                  fontSize: '12px',
                }}
                formatter={(val) => [Number(val).toFixed(3), 'Coefficient Impact']}
              />
              <Bar dataKey="value" name="Coefficient" radius={[0, 6, 6, 0]}>
                {sortedFeatures.map((entry) => (
                  <Cell
                    key={entry.feature}
                    fill={Number(entry.value) >= 0 ? '#B83838' : '#43823C'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FFF8ED] p-4 text-xs border border-[#EBC69F]/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-[#8C2A2A]">
            <span className="size-2.5 rounded-full bg-[#B83838]" /> Positive (Increases Churn Risk)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#2D5A27]">
            <span className="size-2.5 rounded-full bg-[#43823C]" /> Negative (Protects Customer Retention)
          </span>
        </div>
        <p className="text-[11px] text-[#392D35]">
          Order frequency & recent visit intervals are the strongest empirical signals.
        </p>
      </div>
    </Card>
  )
}
