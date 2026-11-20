// Build one API URL and send the request.
export async function request(path, options = {}) {
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Align local hostname with current browser host to prevent CORS preflight mismatch
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === '127.0.0.1' && baseUrl.includes('localhost')) {
      baseUrl = baseUrl.replace('localhost', '127.0.0.1')
    } else if (window.location.hostname === 'localhost' && baseUrl.includes('127.0.0.1')) {
      baseUrl = baseUrl.replace('127.0.0.1', 'localhost')
    }
  }

  const token = localStorage.getItem('access_token')
  const { responseType, skipAuthRedirect, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const requestUrl = `${baseUrl.replace(/\/$/, '')}${path}`
  const hostname = new URL(requestUrl).hostname
  const target = ['localhost', '127.0.0.1', '::1'].includes(hostname)
    ? 'local'
    : hostname.includes('onrender.com')
      ? 'Render'
      : 'remote'
  console.info(`[API REQUEST] ${options.method || 'GET'} ${requestUrl} -> ${target}`)

  const response = await fetch(requestUrl, {
    ...fetchOptions,
    headers,
  })
  const backendTarget = response.headers.get('x-api-deployment') || target
  console.info(`[API RESPONSE] ${response.status} ${requestUrl} <- ${backendTarget}`)

  if (!response.ok) {
    let message = 'Request failed'
    let errorData = {}

    try {
      errorData = await response.json()
      if (Array.isArray(errorData.detail)) {
        message = errorData.detail[0]?.msg || 'Please check the form'
      } else if (errorData.code) {
        message = errorData.code
      } else {
        message = errorData.detail || errorData.message || message
      }
    } catch {
      message = response.statusText || message
    }

    // 401 = bad/expired login. 403 = plan/trial limit — keep the user logged in.
    if (response.status === 401 && !skipAuthRedirect) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    const error = new Error(message)
    error.status = response.status
    error.code = errorData?.code
    error.email = errorData?.email
    throw error
  }

  if (response.status === 204) {
    return null
  }

  if (responseType === 'blob') {
    return response.blob()
  }

  return response.json()
}

// Upload a CSV file for batch predictions.
export function predictBatch(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request('/predict/batch', {
    method: 'POST',
    body: formData,
  })
}

// Get the latest customer risk summary.
export function getStats() {
  return request('/stats')
}

// Get model performance and feature importance details.
export function getInsights() {
  return request('/model/insights')
}

// Log in a user with email and password.
export function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    skipAuthRedirect: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function googleLogin(accessToken) {
  return request('/auth/google', {
    method: 'POST',
    skipAuthRedirect: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  })
}

export function verifyOtp(email, otp) {
  return request('/auth/verify-otp', {
    method: 'POST',
    skipAuthRedirect: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
}

export function resendOtp(email) {
  return request('/auth/resend-otp', {
    method: 'POST',
    skipAuthRedirect: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

// Create a new user account.
export function signupUser(name, email, password, jobRole, termsAccepted) {
  return request('/auth/signup', {
    method: 'POST',
    skipAuthRedirect: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, job_role: jobRole || null, terms_accepted: termsAccepted }),
  })
}

// Restore the current user from the saved token.
export function getCurrentUser() {
  return request('/auth/me')
}

export function saveOnboarding(data) {
  return request('/onboarding', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function completeOnboarding() {
  return request('/onboarding/complete', { method: 'POST' })
}

// Get previous single and batch prediction records.
export function getHistory() {
  return request('/history')
}

// Get previous bulk CSV upload runs.
export function getUploadHistory() {
  return request('/uploads').catch(() => request('/history'))
}

// Get deep details and customer predictions for a specific upload run.
export function getUploadDetails(uploadId) {
  return request(`/uploads/${uploadId}`)
}

// Download Excel results for a specific upload run.
export async function downloadUploadResults(uploadId) {
  const blob = await request(`/uploads/${uploadId}/download`, { responseType: 'blob' })
  return blob
}

// Delete a specific upload run from history.
export function deleteUpload(uploadId) {
  return request(`/uploads/${uploadId}`, {
    method: 'DELETE',
  })
}

export function getLatestPredictions() {
  return request('/predictions/latest')
}

export async function downloadHistory(runId) {
  const blob = await request(`/history/${runId}/download`, { responseType: 'blob' })
  return blob
}

// Get the current user's profile.
export function getMe() {
  return request('/auth/me')
}

// Update the current user's name.
export function updateProfile(profile) {
  return request('/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
}

// Upload a profile image through the protected backend route.
export function uploadProfilePhoto(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/auth/photo', {
    method: 'POST',
    body: formData,
  })
}

// Change the current user's password.
export function changePassword(currentPassword, newPassword) {
  return request('/auth/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })
}

// Read the logged-in user's plan and remaining trials.
export function getPlan() {
  return request('/plan/me')
}

// Ask the backend to create a Razorpay order for pro or business.
export function createOrder(plan) {
  return request('/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
}

// Confirm a Razorpay payment before the backend upgrades the plan.
export function verifyPayment(payload) {
  return request('/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

// Send a visitor's contact message.
export function sendContact(name, email, message) {
  return request('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
}

// ==========================================
// CHATBOT API INTEGRATION
// ==========================================

export function sendChatMessage(message, sessionId, context = {}) {
  return request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId, context }),
    skipAuthRedirect: true,
  })
}

export function getChatHistory(sessionId) {
  const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
  return request(`/api/chat/history${query}`, {
    skipAuthRedirect: true,
  })
}

export function clearChatHistory(sessionId) {
  const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
  return request(`/api/chat/history${query}`, {
    method: 'DELETE',
    skipAuthRedirect: true,
  })
}

export function getChatSuggestions() {
  return request('/api/chat/suggestions', {
    skipAuthRedirect: true,
  })
}

// ==========================================
// RETENTION INTELLIGENCE API
// ==========================================

export function getRetentionAnalysis(uploadId) {
  return request(`/api/retention/analysis/${uploadId}`)
}

export function getLatestRetentionAnalysis() {
  return request('/api/retention/latest')
}

export function getCustomerRetention(customerId) {
  return request(`/api/retention/customer/${encodeURIComponent(customerId)}`)
}

export function updateCustomerAction(customerId, actionId, status, notes = '') {
  return request(`/api/retention/actions/${encodeURIComponent(customerId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action_id: actionId, status, notes }),
  })
}

