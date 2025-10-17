"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { AuthUser, Role } from "@/lib/types"

interface AuthContextValue {
  currentUser: AuthUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  isSessionValid: boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionValid, setIsSessionValid] = useState(false)

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
          setIsSessionValid(true)
        } else {
          setCurrentUser(null)
          setIsSessionValid(false)
        }
      } catch {
        setCurrentUser(null)
        setIsSessionValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [])

  async function login(username: string, password: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) return false

      const data = await response.json()
      setCurrentUser(data.user)
      setIsSessionValid(true)
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setCurrentUser(null)
      setIsSessionValid(false)
    }
  }

  async function refreshSession() {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
        setIsSessionValid(true)
      } else {
        setCurrentUser(null)
        setIsSessionValid(false)
      }
    } catch {
      setCurrentUser(null)
      setIsSessionValid(false)
    }
  }

  const value = useMemo(
    () => ({ currentUser, login, logout, isLoading, isSessionValid, refreshSession }),
    [currentUser, isLoading, isSessionValid]
  )
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
