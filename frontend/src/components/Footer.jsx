// CohortSection.jsx - "Engineered for Revenue Precision": text on the left, cohort card on the right
import { useState } from "react";

const TABS = ["Workspace Cohorts", "Risk Profiles", "Model Validation"];

const POINTS = [
  "Immediate ARR-weighted prioritization filter",
  "Exportable clean lists to HubSpot, Braze & Customer.io",
  "Automated weekly drift evaluation on cohort churn percentages",
];

// bar = colour, width = how full the bar is (percent)
const COHORTS = [
  { name: "Critical Risk Cohort (> 70%)", info: "1,248 accounts • $142,400 ARR", bar: "bg-red-700", dot: "bg-red-700", width: 28 },
  { name: "Moderate Caution Cohort (35% - 70%)", info: "2,110 accounts • $230,900 ARR", bar: "bg-sky-400", dot: "bg-sky-400", width: 44 },
  { name: "Resilient / Healthy (< 35%)", info: "3,685 accounts • $252,100 ARR", bar: "bg-green-800", dot: "bg-green-800", width: 68 },
];

const ACCOUNTS = [
  { name: "Stripe Sync Pro", tenure: "2 mo", rev: "$1,100", score: "94.8%", high: true },
  { name: "Vortex.Media", tenure: "4 mo", rev: "$840", score: "88.1%", high: true },
  { name: "CloudFlow Engine", tenure: "24 mo", rev: "$3,400", score: "14.2%", high: false },
];

export default function CohortSection() {
  const [tab, setTab] = useState(TABS[0]); // only changes which tab looks selected

  return (
    <section id="solutions" className="mx-auto max-w-6xl scroll-mt-20 px-4">
      <div className="rounded-2xl bg-[#f0f0ff] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-indigo-600">Deep Dive Telemetry</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Engineered for Revenue Precision</h2>
          </div>
          <div className="flex rounded-lg bg-indigo-50 p-1 text-xs">
            {TABS.map((name) => (
              <button key={name} type="button" onClick={() => setTab(name)}
                className={`rounded-md px-3 py-1.5 ${tab === name ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-1 font-mono text-[10px] font-medium text-indigo-700">
              Adjustable Risk Thresholds
            </span>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Dynamic Cohort Triage with Instant Sensitivity Sliders</h3>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Segment entire subscriber populations into high, medium, and healthy retention cohorts.
              Calibrate probability sensitivity thresholds on the fly to balance false positives with
              critical preservation revenue.
            </p>
            <ul className="mt-5 space-y-2.5">
              {POINTS.map((text) => (
                <li key={text} className="flex gap-2.5 text-xs text-slate-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-green-700" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" />
                  </svg>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">Live Cohort Distribution</p>
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-mono text-[10px] text-indigo-700">N = 7,043 Active Subscribers</span>
            </div>
            <ul className="mt-5 space-y-4">
              {COHORTS.map((c) => (
                <li key={c.name}>
                  <div className="flex flex-wrap justify-between gap-1 text-[11px]">
                    <span className="flex items-center gap-1.5 font-mono text-slate-600">
                      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />{c.name}
                    </span>
                    <span className="font-mono font-medium text-slate-800">{c.info}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-indigo-50">
                    <div className={`h-2 rounded-full ${c.bar}`} style={{ width: `${c.width}%` }} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead className="font-mono text-[10px] uppercase text-slate-400">
                  <tr><th className="pb-2 font-normal">Account</th><th className="pb-2 font-normal">Tenure</th>
                    <th className="pb-2 font-normal">Monthly Rev</th><th className="pb-2 text-right font-normal">Risk Score</th></tr>
                </thead>
                <tbody>
                  {ACCOUNTS.map((a) => (
                    <tr key={a.name} className="border-t border-slate-100">
                      <td className="py-2.5 text-slate-700">{a.name}</td>
                      <td className="py-2.5 font-mono text-slate-500">{a.tenure}</td>
                      <td className="py-2.5 font-mono text-slate-500">{a.rev}</td>
                      <td className={`py-2.5 text-right font-mono font-semibold ${a.high ? "text-red-700" : "text-green-700"}`}>{a.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
