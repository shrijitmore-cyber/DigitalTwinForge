import axios from 'axios'

const TOKEN_KEY = 'kes22_token'
const USER_KEY  = 'kes22_user'

export const api = axios.create({ baseURL: '/api' })

// Attach JWT to every request automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export async function login(username, password) {
  const form = new URLSearchParams({ username, password })
  const { data } = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify({ username: data.username }))
  return data
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
