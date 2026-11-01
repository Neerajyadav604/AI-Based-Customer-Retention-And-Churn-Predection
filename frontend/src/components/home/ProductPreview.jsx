import RiskBadge from '../RiskBadge'
import recommendations from '../../data/recommendations'

// Show a clearly labelled static product preview.
export default function ProductPreview() {
  return (
    <div className="mt-14 overflow-hidden rounded-lg border border-indigo-100 bg-white shadow-[0_16px_35px_rgba(70,60,150,0.12)]">
      <div className="flex items-center gap-3 bg-[#f1f2ff] px-3 py-2 text-[9px] text-slate-500">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-red-300" />
          <span className="size-2 rounded-full bg-amber-300" />
          <span className="size-2 rounded-full bg-green-300" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded bg-white/70 px-3 py-1 font-mono">
          churnguard.app / customer-risk-overview
        </div>
        <span className="hidden rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700 sm:inline">Sample data</span>
      </div>
      <div className="grid gap-2 bg-[#f8f8ff] p-2 md:grid-cols-[1fr_1.35fr_0.95fr]">
        <div className="rounded border border-indigo-100 bg-[#f0f1ff] p-4">
          <div className="flex items-start justify-between gap-2">
            <RiskBadge riskLevel="High" />
            <span className="font-mono text-[9px] text-slate-500">C1042</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">Customer risk profile</p>
          <p className="mt-1 text-[10px] text-slate-500">Based on recent order activity</p>
          <div className="mt-5 flex items-center gap-3 rounded bg-white p-3">
            <div className="flex size-16 items-center justify-center rounded-full border-[7px] border-red-500 border-r-red-100 text-sm font-semibold text-red-600">91%</div>
            <div className="text-[10px] leading-4 text-slate-600">
              <p className="font-medium text-slate-800">Needs attention</p>
              <p>Predicted risk is high. Consider a personal message soon.</p>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-indigo-100 pt-3 text-[9px] text-slate-500">
            <span>Recent orders</span><span className="font-mono text-slate-700">3</span>
          </div>
        </div>
        <div className="rounded border border-indigo-100 bg-[#f0f1ff] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700">Risk signals</p>
            <span className="font-mono text-[9px] text-slate-400">Order history</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-600">A simple view of the factors behind the customer risk label.</p>
          <div className="mt-5 space-y-3">
            {['Longer than usual order gap', 'Lower recent order frequency', 'Recent spend is falling', 'Customer has active history'].map((label, index) => (
              <div key={label}>
                <div className="flex justify-between gap-2 text-[10px] text-slate-700"><span>{label}</span><span className={index === 3 ? 'text-green-600' : 'text-red-600'}>{index === 3 ? 'helps' : 'raises risk'}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200"><div className={`h-1.5 rounded-full ${index === 3 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${[78, 64, 51, 36][index]}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-indigo-100 pt-3 font-mono text-[9px] text-slate-400">Use model insights to understand the prediction.</p>
        </div>
        <div className="rounded border border-indigo-100 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700">Suggested action</p>
          <p className="mt-3 text-sm font-semibold text-slate-900">Reconnect with this customer</p>
          <p className="mt-2 text-[10px] leading-4 text-slate-600">{recommendations.High[0]}</p>
          <div className="mt-5 rounded bg-indigo-50 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-indigo-700">Recommended next step</p>
            <p className="mt-2 text-[10px] leading-4 text-indigo-950">Send a friendly reminder after the customer's usual buying gap.</p>
          </div>
          <button type="button" className="mt-5 w-full rounded bg-indigo-600 px-3 py-2 text-[10px] font-medium text-white">View retention recommendations</button>
        </div>
      </div>
    </div>
  )
}
