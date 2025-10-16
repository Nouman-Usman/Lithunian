"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Wrench, CheckCircle, Users, Clock, Zap, Shield, Phone, Mail, MapPin, ArrowRight, Star } from "lucide-react"

export default function HomePage() {
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
          }
          // If role is neither admin nor mechanic, stay on landing page
        }
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkSession()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-900 p-2.5 shadow-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Garage OS</span>
                <p className="text-xs text-gray-600">Repair Management System</p>
              </div>
            </div>
            <Link href="/login">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
              <Star className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Trusted by 500+ garages worldwide</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl font-bold leading-tight text-gray-900">
              Revolutionize Your
              <br />
              <span className="text-gray-700">
                Garage Operations
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Streamline job management, track repairs in real-time, and grow your business with intelligent tools designed specifically for car repair facilities.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-gray-900 border-gray-300 hover:bg-gray-50">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 text-gray-900">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage your garage efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Fast & Efficient</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Lightning-fast job management with real-time updates keeping your team synchronized and productive.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Users className="h-7 w-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Assign jobs, track mechanic performance, and manage your entire workforce from one central hub.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Job Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Track repairs from intake to completion with detailed progress monitoring and cost management.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Manage appointments efficiently with automated scheduling and automated customer confirmations.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Bank-level encryption and security protocols ensure your business data is always protected and secure.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Wrench className="h-7 w-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Easy Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Seamlessly integrate with existing systems and scale as your garage grows and expands.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-white border border-gray-200 text-center">
              <h3 className="text-5xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Active Garages</p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-gray-200 text-center">
              <h3 className="text-5xl font-bold text-gray-900 mb-2">50K+</h3>
              <p className="text-gray-600">Jobs Managed</p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-gray-200 text-center">
              <h3 className="text-5xl font-bold text-gray-900 mb-2">99.9%</h3>
              <p className="text-gray-600">Uptime SLA</p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-gray-200 text-center">
              <h3 className="text-5xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Premium Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
            {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">Ready to Revolutionize Your Shop?</h2>
            <p className="text-xl text-gray-600">
              Join hundreds of successful garages already using Garage OS to streamline operations and boost profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-gray-900 border-gray-300 hover:bg-gray-50">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-gray-200 bg-white text-center">
              <CardContent className="pt-6">
                <Phone className="h-8 w-8 text-gray-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-gray-900">Phone</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-white text-center">
              <CardContent className="pt-6">
                <Mail className="h-8 w-8 text-gray-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-gray-900">Email</h3>
                <p className="text-gray-600">support@garageos.com</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-white text-center">
              <CardContent className="pt-6">
                <MapPin className="h-8 w-8 text-gray-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-gray-900">Address</h3>
                <p className="text-gray-600">123 Main St, Auto City, AC 12345</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-gray-700" />
                <span className="font-bold text-gray-900">Garage OS</span>
              </div>
              <p className="text-sm text-gray-600">Professional repair management system</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900 transition">Features</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900 transition">About</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900 transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-gray-900 transition">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>© 2024 Garage OS. All rights reserved. | Empowering garages worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
