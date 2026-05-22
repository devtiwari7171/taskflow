import axios from 'axios'

const isProduction = window.location.hostname !== 'localhost'

const BASE = isProduction
  ? 'https://taskflow-production-4f3c.up.railway.app'
  : 'http://localhost:8000'

console.log('API BASE:', BASE)

const client = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
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