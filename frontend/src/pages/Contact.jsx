import { useState } from 'react'
import { sendContact } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import Spinner from '../components/Spinner'

// Let visitors send a message to the project team.
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      await sendContact(form.name, form.email, form.message)
      setSuccess('Thank you. Your message has been sent.')
      setForm({ name: '', email: '', message: '' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-3 text-4xl font-bold text-slate-900">Contact us</h1>
      <p className="mb-6 text-slate-600">Have a question or suggestion? Send a message to the project team.</p>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow-sm">
        <label className="grid gap-1 text-sm font-medium text-slate-700">Name
          <input required name="name" value={form.name} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">Email
          <input required type="email" name="email" value={form.email} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">Message
          <textarea required rows="5" name="message" value={form.message} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <ErrorMessage message={error} />
        {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{success}</p>}
        <button type="submit" disabled={loading} className="rounded bg-blue-700 px-4 py-2 font-medium text-white outline-none hover:bg-blue-800 focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50">
          {loading ? <Spinner label="Sending..." /> : 'Send message'}
        </button>
      </form>
    </section>
  )
}
