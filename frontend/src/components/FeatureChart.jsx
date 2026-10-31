import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from './Card'

// Sort features by the size of their coefficient.
function sortFeatures(features) {
  return [...features].sort((first, second) => Math.abs(second.value) - Math.abs(first.value))
}

// Display Logistic Regression feature coefficients.
export default function FeatureChart({ features }) {
  const sortedFeatures = sortFeatures(features || [])

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Feature importance</h2>
      {sortedFeatures.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No feature importance data is available.</p>
      ) : (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedFeatures} layout="vertical" margin={{ left: 24, right: 12 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="feature" width={140} />
              <Tooltip />
              <Bar dataKey="value" name="Coefficient">
                {sortedFeatures.map((feature) => (
                  <Cell key={feature.feature} fill={Number(feature.value) >= 0 ? '#dc2626' : '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-3 text-sm text-slate-500">
        Coefficients from the Logistic Regression model. Frequency is the strongest signal.
        Related features overlap, so treat the other bars as rough guidance.
      </p>
    </Card>
  )
}
