"use client"

import { useMemo, useState } from "react"
import { useAppointments } from "@/hooks/use-appointments"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const statuses = ["Scheduled", "Confirmed", "Completed", "Canceled", "No-Show"] as const

export function AppointmentsView() {
  const { appointments, setStatus, removeAppointment } = useAppointments()
  const [query, setQuery] = useState("")
  const [status, setStatusFilter] = useState<string | "All">("All")
  const [service, setService] = useState<string | "All">("All")

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        const q = query.trim().toLowerCase()
        const matchQ =
          !q ||
          [a.customer.name, a.customer.phone, a.vehicle.plate, a.serviceType].some((s) =>
            (s || "").toLowerCase().includes(q),
          )
        const matchStatus = status === "All" || a.status === status
        const matchService = service === "All" || a.serviceType === service
        return matchQ && matchStatus && matchService
      })
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
  }, [appointments, query, status, service])

  const serviceTypes = useMemo(() => {
    return Array.from(new Set(appointments.map((a) => a.serviceType))).sort()
  }, [appointments])

  function statusBadgeColor(s: string) {
    switch (s) {
      case "Scheduled":
        return "bg-muted text-foreground"
      case "Confirmed":
        return "bg-primary/10 text-primary"
      case "Completed":
        return "bg-green-600/10 text-green-700"
      case "Canceled":
        return "bg-destructive/10 text-destructive"
      case "No-Show":
        return "bg-orange-500/10 text-orange-600"
      default:
        return "bg-muted text-foreground"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search appointments (name, phone, plate, service)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-80"
        />
        <Select value={status} onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={service} onValueChange={(v) => setService(v)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Services</SelectItem>
            {serviceTypes.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Mechanic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => {
              const d = new Date(a.startsAt)
              const date = d.toLocaleDateString()
              const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              return (
                <TableRow key={a.id} className="hover:bg-muted/40">
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{a.customer.name}</TableCell>
                  <TableCell>{a.vehicle.plate}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{a.serviceType}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{a.mechanicName || "—"}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeColor(a.status)}>{a.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => setStatus(a.id, "Confirmed")}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setStatus(a.id, "Completed")}>
                      Complete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeAppointment(a.id)}>
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
