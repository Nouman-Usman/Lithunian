"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { demoAppointments } from "@/lib/demo-data"

const STORAGE_KEY = "garage-os.appointments"

function loadInitial(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    return demoAppointments
  } catch {
    return demoAppointments
  }
}

function persist(value: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const initial = loadInitial()
    setAppointments(initial)
  }, [])

  useEffect(() => {
    if (appointments.length > 0) {
      persist(appointments)
    }
  }, [appointments])

  const upcomingTodayCount = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return appointments.filter((a) => {
      const d = new Date(a.startsAt)
      return d >= start && d <= end
    }).length
  }, [appointments])

  function addAppointment(input: Omit<Appointment, "id">) {
    const id = `apt-${Math.random().toString(36).slice(2, 8)}`
    const next: Appointment = { id, ...input }
    setAppointments((prev) => {
      const updated = [next, ...prev].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
      return updated
    })
    toast({ title: "Appointment created", description: `${input.customer.name} • ${input.serviceType}` })
    return id
  }

  function updateAppointment(id: string, patch: Partial<Appointment>) {
    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      return updated
    })
    toast({ title: "Appointment updated" })
  }

  function removeAppointment(id: string) {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    toast({ title: "Appointment removed" })
  }

  function setStatus(id: string, status: AppointmentStatus) {
    updateAppointment(id, { status })
  }

  return {
    appointments,
    addAppointment,
    updateAppointment,
    removeAppointment,
    setStatus,
    upcomingTodayCount,
  }
}
