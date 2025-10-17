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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, vehicleId, repairType, complaintNotes, mechanicId } = body

    // Validation
    if (!customerId || !vehicleId || !repairType) {
      return NextResponse.json(
        { message: "Missing required fields: customerId, vehicleId, repairType" },
        { status: 400 }
      )
    }

    // Verify customer and vehicle exist
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) },
    })

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      )
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(vehicleId) },
    })

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      )
    }

    if (vehicle.customer_id !== parseInt(customerId)) {
      return NextResponse.json(
        { message: "Vehicle does not belong to this customer" },
        { status: 400 }
      )
    }

    // Create new job
    const newJob = await prisma.job.create({
      data: {
        customer_id: parseInt(customerId),
        vehicle_id: parseInt(vehicleId),
        mechanic_id: mechanicId ? parseInt(mechanicId) : null,
        status: "active",
        repair_type: repairType,
        complaint_notes: complaintNotes || null,
        labor_cost: 0,
        parts_cost: 0,
        total_cost: 0,
      },
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
    })

    // Format response
    const formattedJob = {
      id: newJob.id,
      licensePlate: newJob.vehicle?.license_plate,
      manufacturer: newJob.vehicle?.make,
      model: newJob.vehicle?.model,
      serviceType: newJob.repair_type,
      status: newJob.status,
      mechanicName: newJob.mechanic?.name || newJob.mechanic?.username || "—",
      dateIn: newJob.created_at,
      totalSale: newJob.labor_cost + newJob.parts_cost,
      totalCost: newJob.total_cost,
      marginPercentage: 0,
    }

    return NextResponse.json(
      {
        message: "Job created successfully",
        job: formattedJob,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create job error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
