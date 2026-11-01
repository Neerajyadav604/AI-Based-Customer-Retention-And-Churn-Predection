import { useState } from 'react'

// Render a password input with a simple show and hide control.
export default function PasswordField({ label, value, onChange, required = true, name, placeholder = '', className = '' }) {
  const [visible, setVisible] = useState(false)

  return (
    <label className={`grid gap-2 text-xs font-medium text-slate-300 ${className}`}>
      {label}
      <span className="relative">
        <input name={name} placeholder={placeholder} required={required} type={visible ? 'text' : 'password'} value={value} onChange={onChange} className="auth-input w-full pr-16" />
        <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-400">
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
    </label>
  )
}
