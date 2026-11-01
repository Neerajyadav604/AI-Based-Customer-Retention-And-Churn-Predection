// Show simple project contact information.
export default function Contact() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-3 text-4xl font-bold text-slate-900">Contact</h1>
      <p className="text-slate-600">This is a final-year B.Tech project about helping small sellers understand customer churn.</p>
      <p className="mt-4 text-slate-600">
        {/* TODO: replace with the real email */}
        Email us at <a href="mailto:hello@example.com" className="font-medium text-indigo-600 underline outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">hello@example.com</a>
      </p>
    </section>
  )
}
