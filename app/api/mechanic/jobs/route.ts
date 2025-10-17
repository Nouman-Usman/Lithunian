import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get current mechanic from session
    const sessionResponse = await fetch(new URL("/api/auth/session", request.url).toString(), {
      headers: request.headers,
    })

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const session = await sessionResponse.json()
    const mechanicId = session.user?.id

    if (!mechanicId) {
      return NextResponse.json(
        { message: "Mechanic ID not found" },
        { status: 400 }
      )
    }

    // Fetch jobs assigned to this mechanic
    const jobs = await prisma.job.findMany({
      where: {
        mechanic_id: mechanicId,
        status: {
          in: ["active", "in-progress"],
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            license_plate: true,
            make: true,
            model: true,
            year: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        parts_used: {
          select: {
            id: true,
            part_name: true,
            supplier_name: true,
            sku: true,
            qty: true,
            buy_price: true,
            sell_price: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Format jobs for response
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      licensePlate: job.vehicle?.license_plate,
      manufacturer: job.vehicle?.make,
      model: job.vehicle?.model,
      year: job.vehicle?.year,
      vehicleId: job.vehicle?.id,
      serviceType: job.repair_type,
      status: job.status,
      officeComment: job.complaint_notes,
      mechanicComment: job.diagnosis_notes,
      partsUsed: job.parts_used.map((part) => ({
        id: part.id,
        partName: part.part_name,
        supplierName: part.supplier_name,
        sku: part.sku,
        qty: part.qty,
      })),
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    }))

    return NextResponse.json(
      {
        jobs: formattedJobs,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get mechanic jobs error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
