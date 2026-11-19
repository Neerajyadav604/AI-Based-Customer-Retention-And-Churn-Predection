import { getRiskLevel } from '../utils/risk'

// Risk badge styled with warm, clear indicators matching the palette.
export default function RiskBadge({ riskLevel, probability, size = 'sm' }) {
  const level = riskLevel || (probability != null ? getRiskLevel(probability) : 'Low')

  const styles = {
    Low: 'border-[#7EAA79] bg-[#EAF5E9] text-[#2D5A27]',
    Medium: 'border-[#E6B95F] bg-[#FAF2DF] text-[#8C6819]',
    High: 'border-[#C87979] bg-[#FAECEC] text-[#8C2A2A]',
  }

  const dots = {
    Low: 'bg-[#43823C]',
    Medium: 'bg-[#D6A34E]',
    High: 'bg-[#B83838]',
  }

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-semibold',
  }

  const style = styles[level] || 'border-[#A99BB9] bg-[#F4D3B5]/40 text-[#494269]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${style}`}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${dots[level] || 'bg-[#494269]'}`} />
      <span>{level}</span>
    </span>
  )
}
