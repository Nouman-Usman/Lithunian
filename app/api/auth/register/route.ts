import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json()

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password, // In production, you should hash the password
        role: role || "mechanic", // Default role is mechanic
        name: null, // Can be set later by the user
      },
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
