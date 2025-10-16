"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppointments } from "@/hooks/use-appointments"
import type { Appointment } from "@/lib/types"
import { useJobs } from "@/hooks/use-jobs"

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  mechanics?: { id: string; name: string }[]
  trigger?: React.ReactNode
}

export function NewAppointmentDialog({ open, onOpenChange, mechanics = [], trigger }: Props) {
  const { addAppointment } = useAppointments()
  const { customers, jobs } = useJobs?.() ?? ({ customers: [], jobs: [] } as any)

  const [data, setData] = useState<Partial<Appointment>>({
    durationMinutes: 60,
    status: "Scheduled",
    serviceType: "General Inspection",
  } as Partial<Appointment>)

  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")

  const plateLookup = useMemo(() => {
    const m = new Map<string, any>()
    for (const j of jobs || []) {
      if (j?.vehicle?.plate) m.set(j.vehicle.plate.toUpperCase(), { vehicle: j.vehicle, customer: j.customer })
    }
    for (const c of customers || []) {
      for (const v of c.vehicles || [])
        m.set(v.plate.toUpperCase(), { vehicle: v, customer: { name: c.name, phone: c.phone, email: c.email } })
    }
    return m
  }, [customers, jobs])

  function onPlateChange(v: string) {
    const plate = v.toUpperCase()
    setData((d) => ({ ...d, vehicle: { ...(d.vehicle || {}), plate } }))
    const hit = plateLookup.get(plate)
    if (hit) {
      setData((d) => ({
        ...d,
        vehicle: { ...hit.vehicle, plate },
        customer: { ...hit.customer },
      }))
    }
  }

  function submit() {
    if (!date || !time) return
    const startsAt = new Date(`${date}T${time}:00`)
    const payload: Omit<Appointment, "id"> = {
      startsAt: startsAt.toISOString(),
      durationMinutes: data.durationMinutes || 60,
      status: (data.status as any) || "Scheduled",
      customer: {
        name: data.customer?.name || "",
        phone: data.customer?.phone || "",
        email: data.customer?.email,
      },
      vehicle: {
        plate: data.vehicle?.plate || "",
        manufacturer: data.vehicle?.manufacturer,
        model: data.vehicle?.model,
        year: data.vehicle?.year,
      },
      serviceType: data.serviceType || "General Inspection",
      mechanicId: data.mechanicId,
      mechanicName: data.mechanicName,
      notes: data.notes,
    }
    addAppointment(payload)
    onOpenChange?.(false)
  }

  const content = (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Add Appointment</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date*</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Time*</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Duration (min)</Label>
            <Input
              type="number"
              min={15}
              step={15}
              value={data.durationMinutes ?? 60}
              onChange={(e) => setData((d) => ({ ...d, durationMinutes: Number(e.target.value || 60) }))}
            />
          </div>
          <div className="col-span-2">
            <Label>Service Type*</Label>
            <Input
              placeholder="e.g. Oil Change"
              value={data.serviceType ?? ""}
              onChange={(e) => setData((d) => ({ ...d, serviceType: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Customer Name*</Label>
            <Input
              value={data.customer?.name ?? ""}
              onChange={(e) => setData((d) => ({ ...d, customer: { ...(d.customer || {}), name: e.target.value } }))}
            />
          </div>
          <div>
            <Label>Phone*</Label>
            <Input
              value={data.customer?.phone ?? ""}
              onChange={(e) => setData((d) => ({ ...d, customer: { ...(d.customer || {}), phone: e.target.value } }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={data.customer?.email ?? ""}
              onChange={(e) => setData((d) => ({ ...d, customer: { ...(d.customer || {}), email: e.target.value } }))}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={(data.status as any) || "Scheduled"}
              onValueChange={(v) => setData((d) => ({ ...d, status: v as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
                <SelectItem value="No-Show">No-Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>License Plate*</Label>
            <Input value={data.vehicle?.plate ?? ""} onChange={(e) => onPlateChange(e.target.value)} />
          </div>
          <div>
            <Label>Mechanic</Label>
            <Select
              value={data.mechanicId}
              onValueChange={(id) => {
                const mech = mechanics.find((m) => m.id === id)
                setData((d) => ({ ...d, mechanicId: id, mechanicName: mech?.name }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mechanic" />
              </SelectTrigger>
              <SelectContent>
                {mechanics.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Manufacturer</Label>
            <Input
              value={data.vehicle?.manufacturer ?? ""}
              onChange={(e) =>
                setData((d) => ({ ...d, vehicle: { ...(d.vehicle || {}), manufacturer: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>Model</Label>
            <Input
              value={data.vehicle?.model ?? ""}
              onChange={(e) => setData((d) => ({ ...d, vehicle: { ...(d.vehicle || {}), model: e.target.value } }))}
            />
          </div>
          <div>
            <Label>Year</Label>
            <Input
              type="number"
              value={data.vehicle?.year ?? ""}
              onChange={(e) =>
                setData((d) => ({ ...d, vehicle: { ...(d.vehicle || {}), year: Number(e.target.value) || undefined } }))
              }
            />
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea
            value={data.notes ?? ""}
            onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Additional details, preferences, etc."
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={!date || !time || !(data.customer?.name && data.customer?.phone && data.vehicle?.plate)}
        >
          Create Appointment
        </Button>
      </DialogFooter>
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  )
}
