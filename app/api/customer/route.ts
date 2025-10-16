import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        vehicles: {
          select: {
            license_plate: true,
            make: true,
            model: true,
            year: true,
          },
        },
        jobs: {
          select: {
            id: true,
            labor_cost: true,
            parts_cost: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Format customers for response
    const formattedCustomers = customers.map((customer) => {
      // Calculate lifetime jobs and revenue
      const lifetimeJobs = customer.jobs.length
      const lifetimeRevenue = customer.jobs.reduce(
        (total, job) => total + (job.labor_cost + job.parts_cost),
        0
      )

      // Get last visit date
      const lastVisit =
        customer.jobs.length > 0
          ? new Date(customer.jobs[0].created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Never"

      // Format vehicles
      const vehiclesText = customer.vehicles
        .map((v) => `${v.license_plate} (${v.make} ${v.model})`)
        .join(", ")

      // Determine customer status
      const status = lifetimeJobs > 0 ? "Old Customer" : "New Customer"

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        vehicles: vehiclesText || "—",
        lastVisit,
        lifetimeJobs,
        lifetimeRevenue: `$${lifetimeRevenue.toFixed(2)}`,
        status,
      }
    })

    return NextResponse.json(
      {
        customers: formattedCustomers,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get customers error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
