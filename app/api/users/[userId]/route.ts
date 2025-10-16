import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const id = parseInt(userId, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid userId" },
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

    // Prevent deleting admin users
    if (user.role === "admin") {
      return NextResponse.json(
        { message: "Cannot delete admin users" },
        { status: 403 }
      )
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        message: "User deleted successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
