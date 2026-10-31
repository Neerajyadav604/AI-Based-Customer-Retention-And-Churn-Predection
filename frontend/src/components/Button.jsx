// Provide consistent primary, secondary, and ghost buttons.
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  }

  return (
    <button className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
