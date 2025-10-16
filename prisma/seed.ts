const { prisma: db } = require("../lib/prisma")

async function main() {
  console.log("🌱 Seeding database with dummy data...")

  try {
    // Clear existing data
    await db.part.deleteMany()
    await db.job.deleteMany()
    await db.vehicle.deleteMany()
    await db.customer.deleteMany()
    console.log("✅ Cleared existing data")

    // Create Customers
    const customers = await db.customer.createMany({
      data: [
        {
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1 (555) 123-4567",
          source: "Google Maps",
        },
        {
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+1 (555) 234-5678",
          source: "Referral",
        },
        {
          name: "Michael Chen",
          email: "mchen@email.com",
          phone: "+1 (555) 345-6789",
          source: "Website",
        },
        {
          name: "Emily Davis",
          email: "emily.d@email.com",
          phone: "+1 (555) 456-7890",
          source: "Phone",
        },
        {
          name: "Robert Wilson",
          email: "r.wilson@email.com",
          phone: "+1 (555) 567-8901",
          source: "Walk-in",
        },
      ],
    })
    console.log(`✅ Created ${customers.count} customers`)

    // Create Vehicles
    const customerIds = await db.customer.findMany({
      select: { id: true },
    })

    const vehicles = await db.vehicle.createMany({
      data: [
        {
          customer_id: customerIds[0].id,
          make: "Toyota",
          model: "Camry",
          year: 2020,
          license_plate: "ABC123",
          engine_cc: 2500,
          power_kw: 175,
        },
        {
          customer_id: customerIds[0].id,
          make: "Honda",
          model: "Civic",
          year: 2021,
          license_plate: "XYZ789",
          engine_cc: 1500,
          power_kw: 130,
        },
        {
          customer_id: customerIds[1].id,
          make: "Ford",
          model: "Mustang",
          year: 2019,
          license_plate: "DEF456",
          engine_cc: 5000,
          power_kw: 338,
        },
        {
          customer_id: customerIds[2].id,
          make: "BMW",
          model: "X5",
          year: 2022,
          license_plate: "GHI789",
          engine_cc: 3000,
          power_kw: 250,
        },
        {
          customer_id: customerIds[3].id,
          make: "Mercedes",
          model: "C-Class",
          year: 2021,
          license_plate: "JKL012",
          engine_cc: 1600,
          power_kw: 150,
        },
        {
          customer_id: customerIds[4].id,
          make: "Audi",
          model: "A4",
          year: 2020,
          license_plate: "MNO345",
          engine_cc: 2000,
          power_kw: 200,
        },
      ],
    })
    console.log(`✅ Created ${vehicles.count} vehicles`)

    // Get mechanic users for job assignment
    const mechanics = await db.user.findMany({
      where: { role: "mechanic" },
      select: { id: true },
    })

    const vehicleIds = await db.vehicle.findMany({
      select: { id: true },
    })

    // Create Jobs
    const jobs = await db.job.createMany({
      data: [
        {
          vehicle_id: vehicleIds[0].id,
          customer_id: customerIds[0].id,
          mechanic_id: mechanics[0]?.id || null,
          status: "active",
          repair_type: "Oil Change",
          complaint_notes: "Regular maintenance",
          diagnosis_notes: "Oil and filter replacement needed",
          labor_cost: 50,
          parts_cost: 30,
          total_cost: 80,
        },
        {
          vehicle_id: vehicleIds[1].id,
          customer_id: customerIds[0].id,
          mechanic_id: mechanics[1]?.id || null,
          status: "in-progress",
          repair_type: "Brakes",
          complaint_notes: "Brake pads worn out",
          diagnosis_notes: "Front brake pads need replacement",
          labor_cost: 150,
          parts_cost: 120,
          total_cost: 270,
        },
        {
          vehicle_id: vehicleIds[2].id,
          customer_id: customerIds[1].id,
          mechanic_id: mechanics[0]?.id || null,
          status: "repaired",
          repair_type: "Engine Diagnostics",
          complaint_notes: "Check engine light",
          diagnosis_notes: "O2 sensor replaced",
          labor_cost: 200,
          parts_cost: 150,
          total_cost: 350,
        },
        {
          vehicle_id: vehicleIds[3].id,
          customer_id: customerIds[2].id,
          mechanic_id: mechanics[1]?.id || null,
          status: "active",
          repair_type: "Tire Replacement",
          complaint_notes: "Tires worn",
          diagnosis_notes: "All-season tires needed",
          labor_cost: 80,
          parts_cost: 400,
          total_cost: 480,
        },
        {
          vehicle_id: vehicleIds[4].id,
          customer_id: customerIds[3].id,
          mechanic_id: mechanics[0]?.id || null,
          status: "in-progress",
          repair_type: "Air Filter Replacement",
          complaint_notes: "Engine running rough",
          diagnosis_notes: "Air filter and cabin filter replacement",
          labor_cost: 60,
          parts_cost: 40,
          total_cost: 100,
        },
        {
          vehicle_id: vehicleIds[5].id,
          customer_id: customerIds[4].id,
          mechanic_id: mechanics[1]?.id || null,
          status: "invoice",
          repair_type: "Battery Replacement",
          complaint_notes: "Car won't start",
          diagnosis_notes: "Battery dead, replacement needed",
          labor_cost: 30,
          parts_cost: 120,
          total_cost: 150,
        },
      ],
    })
    console.log(`✅ Created ${jobs.count} jobs`)

    // Create Parts for jobs
    const jobIds = await db.job.findMany({
      select: { id: true },
    })

    const parts = await db.part.createMany({
      data: [
        {
          job_id: jobIds[0].id,
          part_name: "Oil Filter",
          supplier_name: "AutoZone",
          sku: "OIL-FLT-001",
          qty: 1,
          buy_price: 8,
          sell_price: 15,
        },
        {
          job_id: jobIds[0].id,
          part_name: "Synthetic Oil 5W-30",
          supplier_name: "Mobil",
          sku: "OIL-5W30-5L",
          qty: 1,
          buy_price: 18,
          sell_price: 35,
        },
        {
          job_id: jobIds[1].id,
          part_name: "Front Brake Pads",
          supplier_name: "Bosch",
          sku: "BRAKE-PAD-FRT",
          qty: 1,
          buy_price: 60,
          sell_price: 120,
        },
        {
          job_id: jobIds[2].id,
          part_name: "O2 Sensor",
          supplier_name: "OEM",
          sku: "O2-SENSOR-001",
          qty: 1,
          buy_price: 120,
          sell_price: 200,
        },
        {
          job_id: jobIds[3].id,
          part_name: "All-Season Tire",
          supplier_name: "Michelin",
          sku: "TIRE-ALL-SN",
          qty: 4,
          buy_price: 80,
          sell_price: 150,
        },
        {
          job_id: jobIds[4].id,
          part_name: "Engine Air Filter",
          supplier_name: "Mann Filter",
          sku: "AIR-FLT-ENG",
          qty: 1,
          buy_price: 15,
          sell_price: 25,
        },
        {
          job_id: jobIds[4].id,
          part_name: "Cabin Air Filter",
          supplier_name: "Mann Filter",
          sku: "AIR-FLT-CAB",
          qty: 1,
          buy_price: 12,
          sell_price: 20,
        },
        {
          job_id: jobIds[5].id,
          part_name: "Car Battery 12V",
          supplier_name: "Optima",
          sku: "BATT-12V-100",
          qty: 1,
          buy_price: 100,
          sell_price: 180,
        },
      ],
    })
    console.log(`✅ Created ${parts.count} parts`)

    console.log("\n✨ Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error during seeding:", error)
    throw error
  }
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
