import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from './Card'

// Count customers in ten probability ranges.
function countBins(customers) {
  const bins = Array.from({ length: 10 }, (_, index) => ({
    label: `${index * 10}-${(index + 1) * 10}%`,
    count: 0,
  }))

  customers.forEach((customer) => {
    const probability = Number(customer.churn_probability)
    const bin = probability === 1 ? 9 : Math.min(9, Math.floor(probability * 10))
    if (probability >= 0 && probability <= 1) bins[bin].count += 1
  })

  return bins
}

// Display the uploaded customers' probability distribution.
export default function ProbabilityHistogram({ customers }) {
  const data = countBins(customers)

  return (
    <Card className="mt-6">
      <h2 className="text-xl font-semibold text-slate-900">Churn probability distribution</h2>
      <p className="mt-1 text-sm text-slate-500">Number of customers in each probability range.</p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value) => [value, 'Customers']} />
            <Bar dataKey="count" name="Customers">
              {data.map((bin, index) => (
                <Cell
                  key={bin.label}
                  fill={index < 4 ? '#16a34a' : index < 6 ? '#d97706' : '#dc2626'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
