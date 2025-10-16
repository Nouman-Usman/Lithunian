"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginCard } from "@/components/login-card"

export default function LoginPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          // User is already logged in, redirect based on role
          if (data.user.role === "admin") {
            router.push("/admin/dashboard")
          } else if (data.user.role === "mechanic") {
            router.push("/mechanic/dashboard")
          } else {
            router.push("/")
          }
        } else {
          // No valid session, show login page
          setIsChecking(false)
        }
      } catch (error) {
        console.error("Session check error:", error)
        // If there's an error, show login page
        setIsChecking(false)
      }
    }

    checkSession()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Garage OS</h1>
          <p className="text-gray-500">Garage Management System</p>
        </div>
        <LoginCard />
      </div>
    </div>
  )
}
