import { NextRequest, NextResponse } from "next/server"
import { invalidateSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("sessionToken")?.value

    if (sessionToken) {
      await invalidateSession(sessionToken)
    }

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    )

    // Clear the session cookie
    response.cookies.set({
      name: "sessionToken",
      value: "",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}
