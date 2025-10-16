import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const jobId = parseInt(id)

    if (isNaN(jobId)) {
      return NextResponse.json(
        { message: "Invalid job ID" },
        { status: 400 }
      )
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
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
            source: true,
          },
        },
        mechanic: {
          select: {
            id: true,
            username: true,
            name: true,
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
    })

    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      )
    }

    // Format job for response
    const formattedJob = {
      id: job.id,
      licensePlate: job.vehicle?.license_plate,
      manufacturer: job.vehicle?.make,
      model: job.vehicle?.model,
      year: job.vehicle?.year,
      customerName: job.customer?.name,
      customerPhone: job.customer?.phone,
      customerEmail: job.customer?.email,
      customerSource: job.customer?.source,
      serviceType: job.repair_type,
      status: job.status,
      mechanicId: job.mechanic_id ? job.mechanic_id.toString() : "",
      mechanicName: job.mechanic?.name || job.mechanic?.username || "—",
      commentFromOffice: job.complaint_notes,
      commentFromMaster: job.diagnosis_notes,
      laborCost: job.labor_cost,
      partsCost: job.parts_cost,
      totalCost: job.total_cost,
      marginPercentage: job.total_cost
        ? (((job.labor_cost + job.parts_cost) - job.total_cost) / job.total_cost) * 100
        : 0,
      partsUsed: job.parts_used.map((part) => ({
        id: part.id,
        partName: part.part_name,
        supplier: part.supplier_name,
        sku: part.sku,
        qty: part.qty,
        cost: part.buy_price,
        salePrice: part.sell_price,
      })),
      dateIn: job.created_at,
      dateUpdated: job.updated_at,
    }

    return NextResponse.json(formattedJob, { status: 200 })
  } catch (error) {
    console.error("Get job error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const jobId = parseInt(id)

    if (isNaN(jobId)) {
      return NextResponse.json(
        { message: "Invalid job ID" },
        { status: 400 }
      )
    }

    const body = await request.json()

    const {
      repair_type,
      status,
      mechanic_id,
      complaint_notes,
      labor_cost,
      parts_cost,
      total_cost,
    } = body

    // Validate required fields
    if (
      repair_type === undefined &&
      status === undefined &&
      mechanic_id === undefined &&
      complaint_notes === undefined &&
      labor_cost === undefined &&
      parts_cost === undefined &&
      total_cost === undefined
    ) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      )
    }

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      )
    }

    // Update job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(repair_type !== undefined && { repair_type }),
        ...(status !== undefined && { status }),
        ...(mechanic_id !== undefined && { mechanic_id }),
        ...(complaint_notes !== undefined && { complaint_notes }),
        ...(labor_cost !== undefined && { labor_cost: parseFloat(labor_cost) }),
        ...(parts_cost !== undefined && { parts_cost: parseFloat(parts_cost) }),
        ...(total_cost !== undefined && { total_cost: parseFloat(total_cost) }),
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
      id: updatedJob.id,
      licensePlate: updatedJob.vehicle?.license_plate,
      manufacturer: updatedJob.vehicle?.make,
      model: updatedJob.vehicle?.model,
      serviceType: updatedJob.repair_type,
      status: updatedJob.status,
      mechanicName: updatedJob.mechanic?.name || updatedJob.mechanic?.username || "—",
      dateIn: updatedJob.created_at,
      totalSale: updatedJob.labor_cost + updatedJob.parts_cost,
      totalCost: updatedJob.total_cost,
      marginPercentage: updatedJob.total_cost
        ? (((updatedJob.labor_cost + updatedJob.parts_cost) - updatedJob.total_cost) / updatedJob.total_cost) * 100
        : 0,
    }

    return NextResponse.json(
      {
        message: "Job updated successfully",
        job: formattedJob,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update job error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const jobId = parseInt(id)

    if (isNaN(jobId)) {
      return NextResponse.json(
        { message: "Invalid job ID" },
        { status: 400 }
      )
    }

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      )
    }

    // Delete job (cascade will handle related records)
    await prisma.job.delete({
      where: { id: jobId },
    })

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete job error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
