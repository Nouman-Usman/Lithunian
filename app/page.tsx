"use client"

import { useState } from "react"
import { OfficeDashboard } from "@/components/office-dashboard"
import { MechanicPortal } from "@/components/mechanic-portal"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/use-auth"
import { LoginCard } from "@/components/login-card"

export default function HomePage() {
  const { currentUser } = useAuth()
  const [view] = useState<"office" | "mechanic">("office") // retained, no longer used

  return (
    <>
      <div className="min-h-screen bg-background">
        {!currentUser ? (
          <div className="max-w-md mx-auto p-6">
            <LoginCard />
          </div>
        ) : currentUser.role === "admin" ? (
          <OfficeDashboard />
        ) : (
          <MechanicPortal />
        )}
      </div>
      <Toaster />
    </>
  )
}
