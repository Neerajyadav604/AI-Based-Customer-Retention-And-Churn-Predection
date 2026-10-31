// Show a small loading indicator.
export default function Spinner({ label = 'Loading...' }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </span>
  )
}
