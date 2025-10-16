export type JobStatus = "Active" | "In Progress" | "Repaired" | "Invoice" | "Archived"

export interface PartRow {
  id: string
  name: string
  supplier: string
  cost: number
  sale: number
}

export interface Job {
  id: string
  licensePlate: string
  manufacturer: string
  model: string
  year: number
  cc?: number
  kw?: number
  serviceType: string
  status: JobStatus
  mechanicAssigned: string
  dateIn: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  foundUs: string
  officeComment: string
  mechanicComment: string
  parts: PartRow[]
  totalCost: number
  totalSale: number
  marginPercent: number
  durationHours: number
  isOldCustomer: boolean
}

export interface CustomerVehicle {
  licensePlate: string
  manufacturer: string
  model: string
  year: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  vehicles: CustomerVehicle[]
  lastVisit: string // ISO date
  lifetimeJobs: number
  lifetimeRevenue: number
  status: "Old" | "New"
}

export type Role = "admin" | "mechanic"

export interface AuthUser {
  id: number
  username: string
  name: string | null
  role: Role
}

export type AppointmentStatus = "Scheduled" | "Confirmed" | "Completed" | "Canceled" | "No-Show"

export interface Appointment {
  id: string
  startsAt: string // ISO
  durationMinutes: number
  status: AppointmentStatus
  customer: {
    name: string
    phone: string
    email?: string
  }
  vehicle: {
    plate: string
    manufacturer?: string
    model?: string
    year?: number
  }
  serviceType: string
  mechanicId?: string
  mechanicName?: string
  notes?: string
  jobId?: string
}
