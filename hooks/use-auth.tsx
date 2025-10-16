"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { AuthUser, Role } from "@/lib/types"

interface AuthContextValue {
  currentUser: AuthUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DUMMY_USERS: Array<{ username: string; password: string; name: string; role: Role }> = [
  { username: "admin", password: "admin123", name: "Office Manager", role: "admin" },
  { username: "mechanic", password: "mechanic123", name: "John Smith", role: "mechanic" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("garage-os-auth")
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthUser
        setCurrentUser(parsed)
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser) localStorage.setItem("garage-os-auth", JSON.stringify(currentUser))
    else localStorage.removeItem("garage-os-auth")
  }, [currentUser])

  async function login(username: string, password: string) {
    const match = DUMMY_USERS.find((u) => u.username === username && u.password === password)
    if (!match) return false
    setCurrentUser({ username: match.username, name: match.name, role: match.role })
    return true
  }

  function logout() {
    setCurrentUser(null)
  }

  const value = useMemo(() => ({ currentUser, login, logout }), [currentUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
