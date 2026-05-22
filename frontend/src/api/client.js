import axios from 'axios'

let BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Force HTTPS in production
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  BASE = BASE.replace('http://', 'https://')
}

const client = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  maxRedirects: 0,   // ← don't follow redirects, fail immediately so we know
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Ensure NO trailing slash on the URL
  if (config.url && config.url.endsWith('/') && config.url !== '/') {
    config.url = config.url.slice(0, -1)
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
