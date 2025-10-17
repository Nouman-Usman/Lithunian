import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required" },
        { status: 400 }
      )
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        customer_id: parseInt(customerId),
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        license_plate: true,
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Format vehicles for response
    const formattedVehicles = vehicles.map((vehicle) => ({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.license_plate,
      display: `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`,
    }))

    return NextResponse.json(
      {
        vehicles: formattedVehicles,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get customer vehicles error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
