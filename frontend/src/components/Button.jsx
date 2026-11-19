// Unified button component with the editorial warm-purple & beige design system + glossy finish.
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  const base =
    'relative inline-flex items-center justify-center font-medium select-none btn-interactive cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'

  const sizes = {
    sm: 'min-h-8 px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'min-h-10 px-5 py-2 text-sm rounded-xl gap-2 font-semibold',
    lg: 'min-h-12 px-7 py-3 text-base rounded-2xl gap-2.5 font-bold',
  }

  // Glossy styles with specular highlights & touch glows
  const variants = {
    primary:
      'bg-gradient-to-b from-[#5C5482] to-[#494269] text-[#FFF3E4] border border-[#EBC69F]/30 shadow-[0_6px_20px_-4px_rgba(73,66,105,0.35)] hover:from-[#494269] hover:to-[#373152]',
    gold:
      'glossy-gold text-[#291C2E] font-bold shadow-[0_8px_20px_-4px_rgba(230,185,95,0.5)] hover:brightness-105',
    secondary:
      'bg-gradient-to-b from-[#FFFFFF] to-[#FFF8ED] text-[#291C2E] border border-[#EBC69F] shadow-sm hover:border-[#E6B95F]',
    outline:
      'bg-transparent text-[#494269] border-2 border-[#494269] hover:bg-[#494269]/10',
    ghost:
      'bg-transparent text-[#494269] hover:bg-[#FFF8ED] hover:text-[#291C2E]',
    danger:
      'bg-gradient-to-b from-[#C85050] to-[#A44343] text-white border border-red-300/30 shadow-[0_6px_20px_-4px_rgba(164,67,67,0.4)] hover:brightness-105',
  }

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
