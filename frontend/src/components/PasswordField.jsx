import { useState } from 'react'

export default function PasswordField({
  label,
  value,
  onChange,
  required = true,
  name,
  placeholder = '',
  className = '',
  theme = 'light', // 'light' for profile/settings in cream cards, 'dark' for login/signup
}) {
  const [visible, setVisible] = useState(false)

  const isDark = theme === 'dark'

  return (
    <label className={`grid gap-1.5 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#F4D3B5]' : 'text-[#291C2E]'} ${className}`}>
      {label}
      <span className="relative block">
        <input
          name={name}
          placeholder={placeholder}
          required={required}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`w-full rounded-2xl border px-4 py-3 pr-16 text-sm font-mono tracking-wider transition-all duration-200 outline-none ${
            isDark
              ? 'border-[#A99BB9]/30 bg-[#291C2E]/75 text-[#FFF3E4] placeholder-[#A99BB9] focus:border-[#E6B95F] focus:ring-2 focus:ring-[#E6B95F]/30'
              : 'border-[#EBC69F] bg-[#FFF3E4] text-[#291C2E] font-semibold placeholder-[#A99BB9] shadow-inner focus:border-[#494269] focus:bg-white focus:ring-2 focus:ring-[#494269]/15'
          }`}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer select-none ${
            isDark
              ? 'text-[#E6B95F] hover:bg-white/10'
              : 'text-[#494269] hover:bg-[#FFF8ED]'
          }`}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
    </label>
  )
}
