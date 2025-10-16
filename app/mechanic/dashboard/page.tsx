"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MechanicPortal } from "@/components/mechanic-portal"

export default function MechanicDashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user.role === "mechanic") {
            setIsAuthorized(true)
          } else {
            router.push("/")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <MechanicPortal />
}
