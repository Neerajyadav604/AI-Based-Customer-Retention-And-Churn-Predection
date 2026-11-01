import LaunchWorkspaceButton from '../LaunchWorkspaceButton'

// Show the final call to action.
export default function HomeCta() {
  return (
    <section id="for-shops" className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center shadow-[0_8px_24px_rgba(70,60,150,0.08)] sm:px-10">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">For small shops and sellers</p>
      <h2 className="mx-auto mt-3 max-w-xl text-2xl font-semibold tracking-tight text-slate-900">Start retaining customers with a clearer next step.</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Built for small online sellers, local vendors and kirana stores as a final-year B.Tech project.</p>
      <LaunchWorkspaceButton className="mt-6 inline-flex rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Launch workspace</LaunchWorkspaceButton>
    </section>
  )
}
