import React, { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  })

  const login = ({ token, user }) => {
    sessionStorage.setItem("token", token)
    sessionStorage.setItem("user", JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
