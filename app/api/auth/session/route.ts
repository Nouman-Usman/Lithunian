import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("sessionToken")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      )
    }

    const session = await validateSession(sessionToken)

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          username: session.user.username,
          name: session.user.name,
          role: session.user.role,
        },
        session: {
          createdAt: session.created_at,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    )
  }
}
