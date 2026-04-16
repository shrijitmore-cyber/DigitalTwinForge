import { createContext, useContext, useState } from 'react'
import { login as apiLogin, logout as apiLogout, getStoredUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  async function login(username, password) {
    const data = await apiLogin(username, password)
    setUser({ username: data.username })
    return data
  }

  function logout() {
    apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
