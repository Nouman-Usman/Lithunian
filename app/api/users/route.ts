import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Fetch all mechanics and admins
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json(
      {
        users,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
