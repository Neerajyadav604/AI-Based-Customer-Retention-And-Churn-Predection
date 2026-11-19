/**
 * Dynamic Risk Classification Logic:
 * - Low Risk: 0%–30%
 * - Medium Risk: Above 30%–60%
 * - High Risk: Above 60%–100%
 */

export function normalizeProbability(probability) {
  if (probability == null || isNaN(probability)) return 0
  const num = Number(probability)
  const pct = num > 1 ? num : num * 100
  return Math.max(0, Math.min(100, Number(pct.toFixed(1))))
}

export function getRiskLevel(probability) {
  const p = normalizeProbability(probability)
  if (p <= 30) return 'Low'
  if (p <= 60) return 'Medium'
  return 'High'
}

export function getRiskPriority(riskLevel) {
  switch (riskLevel) {
    case 'High':
      return 1
    case 'Medium':
      return 2
    case 'Low':
      return 3
    default:
      return 4
  }
}

export const RISK_PALETTE = {
  High: {
    bg: '#FAECEC',
    border: '#C87979',
    text: '#8C2A2A',
    dot: '#B83838',
    bar: '#B83838',
    glow: 'rgba(184, 56, 56, 0.4)',
  },
  Medium: {
    bg: '#FAF2DF',
    border: '#E6B95F',
    text: '#8C6819',
    dot: '#D6A34E',
    bar: '#E6B95F',
    glow: 'rgba(230, 185, 95, 0.4)',
  },
  Low: {
    bg: '#EAF5E9',
    border: '#7EAA79',
    text: '#2D5A27',
    dot: '#43823C',
    bar: '#43823C',
    glow: 'rgba(67, 130, 60, 0.4)',
  },
}

/**
 * Generate human-readable risk explanation from customer's actual metrics
 */
export function explainCustomerRisk(customer) {
  const reasons = []
  const shields = []

  const recency = Number(customer.recency_days ?? 0)
  const frequency = Number(customer.frequency ?? 1)
  const monetary = Number(customer.monetary ?? 0)
  const totalItems = Number(customer.total_items ?? 1)
  const avgOrder = Number(customer.avg_order_value || (monetary / Math.max(1, frequency)))

  // Risk drivers
  if (recency >= 45) {
    reasons.push(`Inactivity gap: Has not placed an order in ${recency} days.`)
  } else if (recency >= 20) {
    reasons.push(`Recency cooling: Last order was ${recency} days ago.`)
  }

  if (frequency <= 1) {
    reasons.push('Single-order purchaser: No established repeat buying habit yet.')
  } else if (frequency === 2) {
    reasons.push('Low purchase frequency: Only 2 historical orders recorded.')
  }

  if (avgOrder < 150) {
    reasons.push(`Low average basket size of ₹${avgOrder.toFixed(0)}, indicating conservative engagement.`)
  }

  // Retention shields
  if (frequency >= 3) {
    shields.push(`Repeat order loyalty: ${frequency} lifetime orders provide retention buffer.`)
  }
  if (monetary > 500) {
    shields.push(`Valuable account: Lifetime spend of ₹${monetary.toLocaleString()}.`)
  }
  if (recency <= 7) {
    shields.push(`High engagement recency: Customer made a purchase within the last 7 days.`)
  }

  if (reasons.length === 0) {
    reasons.push('Purchasing trajectory shows steady engagement with low immediate defection indicators.')
  }

  // Playbook recommendation
  let playbook = ''
  const risk = getRiskLevel(customer.churn_probability)
  if (risk === 'High') {
    playbook = 'Send urgent personalized re-engagement campaign offering free priority shipping or an exclusive bundle credit.'
  } else if (risk === 'Medium') {
    playbook = 'Trigger an automated check-in email with tailored product recommendations and a 10% loyalty perk.'
  } else {
    playbook = 'Maintain standard nurture cadence and invite customer to VIP rewards tier.'
  }

  return { reasons, shields, playbook }
}

