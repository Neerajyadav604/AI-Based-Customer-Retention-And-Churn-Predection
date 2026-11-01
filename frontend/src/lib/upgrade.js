import { createOrder, verifyPayment } from '../api'

// Open Razorpay Checkout for "pro" or "business".
// If there is no JWT, send the user to login first.
export async function upgrade(plan) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    window.location.assign('/login?next=/pricing')
    return
  }

  const data = await createOrder(plan)
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID || data.key_id

  if (!window.Razorpay) {
    throw new Error('Razorpay Checkout did not load. Refresh the page and try again.')
  }
  if (!key || key.includes('xxxxxxxx')) {
    throw new Error('Add your Razorpay TEST key to the frontend .env file.')
  }

  const savedUser = JSON.parse(localStorage.getItem('user') || 'null')

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key,
      amount: data.order.amount,
      currency: data.order.currency || 'INR',
      name: 'ChurnGuard',
      description: `Upgrade to ${plan}`,
      order_id: data.order.id,
      prefill: {
        name: savedUser?.name || '',
        email: savedUser?.email || '',
      },
      theme: { color: '#4f46e5' },
      handler: async (response) => {
        try {
          const result = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan,
          })
          window.dispatchEvent(new Event('plan-updated'))
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    })

    checkout.on('payment.failed', (event) => {
      reject(new Error(event.error?.description || 'Payment failed'))
    })
    checkout.open()
  })
}
