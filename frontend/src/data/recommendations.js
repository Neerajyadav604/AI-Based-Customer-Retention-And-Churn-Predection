// Keep the action arrays for the Predict page.
const recommendations = {
  High: [
    'Send a personal call or message.',
    'Offer a small discount on the next order.',
    'Ask what would make the next order easier.',
    'Send a reminder after the usual ordering gap.',
  ],
  Medium: [
    'Send a friendly reminder about your store.',
    'Offer a small discount on the next order.',
    'Share a useful product suggestion.',
    'Send a thank-you note after the next purchase.',
  ],
  Low: [
    'Send a thank-you note after the next purchase.',
    'Ask the customer to recommend your store.',
    'Share news about a new product or seasonal item.',
    'Send a reminder after the usual ordering gap.',
  ],
}

// Add the meaning and title used by the recommendations page.
export const recommendationInfo = {
  High: { title: 'Reconnect soon', meaning: '60% or above', actions: recommendations.High },
  Medium: { title: 'Keep engaged', meaning: '40% to under 60%', actions: recommendations.Medium },
  Low: { title: 'Build loyalty', meaning: 'Below 40%', actions: recommendations.Low },
}

export default recommendations
