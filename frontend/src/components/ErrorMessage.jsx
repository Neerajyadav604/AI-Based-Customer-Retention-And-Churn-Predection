// Show a consistent error message.
export default function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
      {message}
    </p>
  )
}
