import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status")

    const jobs = await prisma.job.findMany({
      where: status ? { status } : {},
      include: {
        vehicle: {
          select: {
            license_plate: true,
            make: true,
            model: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
        mechanic: {
          select: {
            username: true,
            name: true,
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
      serviceType: job.repair_type,
      status: job.status,
      mechanicName: job.mechanic?.name || job.mechanic?.username || "—",
      dateIn: job.created_at,
      totalSale: job.labor_cost + job.parts_cost,
      totalCost: job.total_cost,
      marginPercentage: job.total_cost ? (((job.labor_cost + job.parts_cost) - job.total_cost) / job.total_cost * 100) : 0,
    }))

    return NextResponse.json(
      {
        jobs: formattedJobs,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get jobs error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
