import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { password } = await request.json()
    const { userId } = await params
    const id = parseInt(userId, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid userId" },
        { status: 400 }
      )
    }

    // Validation
    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password },
      select: {
        id: true,
        username: true,
        role: true,
      },
    })

    return NextResponse.json(
      {
        message: "Password updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update password error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
