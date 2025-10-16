import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }
    const user = await prisma.user.findUnique({
      where: { username },
    })

    // Validate credentials
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }
    const userAgent = request.headers.get("user-agent") || undefined
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     undefined

    const session = await createSession(user.id, userAgent, ipAddress)

    // Return user data and session token
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role as "admin" | "mechanic",
        },
        sessionToken: session.token,
      },
      { status: 200 }
    )

    // Set secure session cookie
    response.cookies.set({
      name: "sessionToken",
      value: session.token,
      maxAge: 7 * 24 * 60 * 60, 
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
