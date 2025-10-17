"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { MechanicPortal } from "@/components/mechanic-portal"

export default function MechanicDashboardPage() {
  const router = useRouter()
  const { currentUser, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login")
    }
    if (!isLoading && currentUser && currentUser.role !== "mechanic") {
      router.push("/")
    }
  }, [currentUser, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.role !== "mechanic") {
    return null
  }

  return <MechanicPortal />
}