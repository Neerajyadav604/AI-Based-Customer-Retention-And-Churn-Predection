// Premium warm cream/beige card surface with glossy reflections and hover glows.
export default function Card({
  children,
  className = '',
  hover = true,
  variant = 'glossy',
  ...props
}) {
  const variants = {
    glossy: 'glossy-card',
    default: 'bg-white border-[#EBC69F]/80 text-[#291C2E] shadow-sm',
    cream: 'bg-gradient-to-br from-[#FFF3E4] to-[#FFF8ED] border-[#EBC69F] text-[#291C2E]',
    purple: 'glossy-purple text-[#FFF3E4]',
    lavender: 'bg-gradient-to-br from-[#FFF3E4] to-[#A99BB9]/20 border-[#A99BB9]/50 text-[#291C2E]',
  }

  return (
    <div
      className={`rounded-3xl p-6 ${
        hover ? 'card-hover-lift' : ''
      } ${variants[variant] || variants.glossy} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
