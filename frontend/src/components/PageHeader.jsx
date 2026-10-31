// Keep page titles and descriptions aligned.
export default function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  )
}
