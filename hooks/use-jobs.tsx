"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Job } from "@/lib/types"

interface JobsContextValue {
  jobs: Job[]
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void
  mechanics: string[]
  addMechanic: (name: string) => void
}

const JobsContext = createContext<JobsContextValue | undefined>(undefined)

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [mechanics, setMechanics] = useState<string[]>([])

  // Load from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem("garage-os-jobs")
    const savedMechs = localStorage.getItem("garage-os-mechanics")

    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs))
      } catch {
        // ignore parse error
      }
    } else {
      setJobs([
        {
          id: "1",
          licensePlate: "ABC123",
          manufacturer: "Toyota",
          model: "Camry",
          year: 2018,
          serviceType: "Oil Change",
          status: "Active",
          mechanicAssigned: "John Smith",
          dateIn: new Date().toISOString(),
          customerName: "Alice Johnson",
          customerPhone: "+1234567890",
          foundUs: "Google",
          officeComment: "Regular oil change service",
          mechanicComment: "",
          parts: [],
          totalCost: 0,
          totalSale: 0,
          marginPercent: 0,
          durationHours: 0,
          isOldCustomer: true,
        },
        {
          id: "2",
          licensePlate: "XYZ789",
          manufacturer: "Honda",
          model: "Civic",
          year: 2020,
          serviceType: "Brakes",
          status: "In Progress",
          mechanicAssigned: "John Smith",
          dateIn: new Date(Date.now() - 86400000).toISOString(),
          customerName: "Bob Williams",
          customerPhone: "+1987654321",
          foundUs: "Recommended",
          officeComment: "Replace front brake pads",
          mechanicComment: "Pads worn down to metal, rotors need resurfacing",
          parts: [
            { id: "p1", name: "Front Brake Pads", supplier: "AutoZone", cost: 45, sale: 85 },
            { id: "p2", name: "Brake Fluid", supplier: "AutoZone", cost: 12, sale: 25 },
          ],
          totalCost: 57,
          totalSale: 110,
          marginPercent: 48.2,
          durationHours: 1.5,
          isOldCustomer: false,
        },
      ])
    }

    if (savedMechs) {
      try {
        setMechanics(JSON.parse(savedMechs))
      } catch {
        // ignore
      }
    } else {
      setMechanics(["John Smith", "Jane Doe", "Mike Wilson", "Sarah Chen"])
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem("garage-os-jobs", JSON.stringify(jobs))
    }
  }, [jobs])

  useEffect(() => {
    if (mechanics.length > 0) {
      localStorage.setItem("garage-os-mechanics", JSON.stringify(mechanics))
    }
  }, [mechanics])

  function addJob(job: Job) {
    setJobs((prev) => [job, ...prev])
  }

  function updateJob(id: string, updates: Partial<Job>) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)))
  }

  function deleteJob(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  function addMechanic(name: string) {
    setMechanics((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }

  return (
    <JobsContext.Provider value={{ jobs, addJob, updateJob, deleteJob, mechanics, addMechanic }}>
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs() {
  const ctx = useContext(JobsContext)
  if (!ctx) throw new Error("useJobs must be used within JobsProvider")
  return ctx
}
