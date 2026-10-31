// Build one API URL and send the request.
export async function request(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const token = localStorage.getItem('access_token')
  const headers = new Headers(options.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const errorData = await response.json()
      message = errorData.detail || errorData.message || message
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

// Create a new user account.
export function signupUser(name, email, password) {
  return request('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
}

// Restore the current user from the saved token.
export function getCurrentUser() {
  return request('/auth/me')
}

// Get previous single and batch prediction records.
export function getHistory() {
  return request('/history')
}

// Get the current user's profile.
export function getMe() {
  return request('/auth/me')
}

// Update the current user's name.
export function updateProfile(name) {
  return request('/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
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

// Send a visitor's contact message.
export function sendContact(name, email, message) {
  return request('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
}
