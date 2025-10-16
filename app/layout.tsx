import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { JobsProvider } from "@/hooks/use-jobs"
import { AuthProvider } from "@/hooks/use-auth"

export const metadata: Metadata = {
  title: "Garage OS",
  description: "Garage Repair Shop Management Dashboard",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <JobsProvider>{children}</JobsProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
