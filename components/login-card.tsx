"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export function LoginCard() {
  const { toast } = useToast()
  const router = useRouter()
  const { login, refreshSession } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Call the login function from the auth hook
      const success = await login(username.trim(), password)
      
      if (!success) {
        toast({
          title: "Invalid credentials",
          description: "Please check your username/password.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({ title: "Welcome back" })

      // Redirect will be handled by the login page's useEffect
      // which monitors the currentUser state from the auth context
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Sign in to Garage OS</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <div className="mt-4 rounded-md border border-border p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Dummy credentials</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Admin — username: <span className="font-mono">admin</span>, password:{" "}
                <span className="font-mono">admin123</span>
              </li>
              <li>
                Mechanic — username: <span className="font-mono">mechanic</span>, password:{" "}
                <span className="font-mono">mechanic123</span>
              </li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
