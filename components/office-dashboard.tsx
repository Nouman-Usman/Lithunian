"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input as TextInput } from "@/components/ui/input"
import { Search, Plus, MoreVertical, Download, X, Settings, LogOut, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useJobs } from "@/hooks/use-jobs"
import { JobDetailSheet } from "@/components/job-detail-sheet"
import { NewJobDialog } from "@/components/new-job-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import type { Job, JobStatus, Customer } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { customers as demoCustomers, monthlyRevenue } from "@/lib/demo-data"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAppointments } from "@/hooks/use-appointments"
import { NewAppointmentDialog } from "@/components/new-appointment-dialog"
import { AppointmentsView } from "@/components/appointments-view"

type NavItem = "active" | "archived" | "customers" | "reports" | "appointments"

export function OfficeDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [newJobOpen, setNewJobOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<JobStatus[]>([])
  const [mechanicFilter, setMechanicFilter] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(25)

  const { jobs, updateJob, deleteJob, mechanics, addMechanic } = useJobs()
  const { toast } = useToast()
  const { currentUser, logout } = useAuth()

  const { upcomingTodayCount } = useAppointments()
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false)

  const [addMechOpen, setAddMechOpen] = useState(false)
  const [newMechanic, setNewMechanic] = useState("")

  function handleAddMechanic() {
    if (!newMechanic.trim()) return
    addMechanic(newMechanic.trim())
    toast({ title: "Mechanic added", description: `${newMechanic} is now available for assignment.` })
    setNewMechanic("")
    setAddMechOpen(false)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable
      if (e.key === "/" && !isTyping) {
        e.preventDefault()
        document.getElementById("global-search")?.focus()
      }
      if (!isTyping && (e.key === "N" || e.key === "n")) {
        e.preventDefault()
        setNewJobOpen(true)
      }
      if (!isTyping && (e.key === "A" || e.key === "a") && (e.shiftKey || e.metaKey)) {
        e.preventDefault()
        setNewAppointmentOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      if (activeNav === "archived") return job.status === "Archived"
      return job.status !== "Archived"
    })

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (j) =>
          j.licensePlate.toLowerCase().includes(q) ||
          j.manufacturer.toLowerCase().includes(q) ||
          j.model.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q),
      )
    }

    if (statusFilter.length > 0) {
      result = result.filter((j) => statusFilter.includes(j.status))
    }

    if (mechanicFilter.length > 0) {
      result = result.filter((j) => mechanicFilter.includes(j.mechanicAssigned))
    }

    return result
  }, [jobs, activeNav, searchQuery, statusFilter, mechanicFilter])

  const activeCount = jobs.filter((j) => j.status !== "Archived").length
  const archivedCount = jobs.filter((j) => j.status === "Archived").length

  const customers: Customer[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return demoCustomers
    return demoCustomers.filter((c) => {
      const inVehicles = c.vehicles.some(
        (v) =>
          v.licensePlate.toLowerCase().includes(q) ||
          v.manufacturer.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q),
      )
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        inVehicles
      )
    })
  }, [searchQuery])

  const kpis = useMemo(() => {
    const totalJobs = jobs.length
    const active = jobs.filter((j) => j.status === "Active").length
    const inProgress = jobs.filter((j) => j.status === "In Progress").length
    const repaired = jobs.filter((j) => j.status === "Repaired" || j.status === "Invoice").length
    const archived = jobs.filter((j) => j.status === "Archived").length
    const totalRevenue = jobs.reduce((sum, j) => sum + (j.totalSale || 0), 0)
    const totalCost = jobs.reduce((sum, j) => sum + (j.totalCost || 0), 0)
    const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
    return { totalJobs, active, inProgress, repaired, archived, totalRevenue, totalCost, overallMargin }
  }, [jobs])

  const serviceBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>()
    for (const j of jobs) {
      const key = j.serviceType || "Other"
      const curr = map.get(key) || { count: 0, revenue: 0 }
      curr.count += 1
      curr.revenue += j.totalSale || 0
      map.set(key, curr)
    }
    return Array.from(map.entries())
      .map(([service, v]) => ({ service, ...v }))
      .sort((a, b) => b.count - a.count)
  }, [jobs])

  function exportCSV() {
    const headers = [
      "License Plate",
      "Manufacturer",
      "Model",
      "Service Type",
      "Status",
      "Mechanic",
      "Date In",
      "Total Sale",
      "Total Cost",
      "Margin %",
    ]
    const rows = filteredJobs.map((j) => [
      j.licensePlate,
      j.manufacturer,
      j.model,
      j.serviceType,
      j.status,
      j.mechanicAssigned,
      new Date(j.dateIn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      j.totalSale.toFixed(2),
      j.totalCost.toFixed(2),
      j.marginPercent.toFixed(1),
    ])
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `jobs-export-${Date.now()}.csv`
    a.click()
    toast({ title: "Export complete", description: `${filteredJobs.length} jobs exported.` })
  }

  function toggleRowSelection(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function bulkArchive() {
    selectedRows.forEach((id) => {
      const job = jobs.find((j) => j.id === id)
      if (job) updateJob(id, { status: "Archived" })
    })
    setSelectedRows(new Set())
    toast({ title: "Jobs archived", description: `${selectedRows.size} jobs archived.` })
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="px-2 py-2">
            <h1 className="text-sm font-semibold text-sidebar-foreground">Garage OS</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeNav === "active"} onClick={() => setActiveNav("active")}>
                  Active Jobs
                </SidebarMenuButton>
                <SidebarMenuBadge>{activeCount}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeNav === "archived"} onClick={() => setActiveNav("archived")}>
                  Archived Jobs
                </SidebarMenuButton>
                <SidebarMenuBadge>{archivedCount}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeNav === "customers"} onClick={() => setActiveNav("customers")}>
                  Customer List
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeNav === "reports"} onClick={() => setActiveNav("reports")}>
                  Reporting
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeNav === "appointments"} onClick={() => setActiveNav("appointments")}>
                  All Appointments
                </SidebarMenuButton>
                <SidebarMenuBadge>{upcomingTodayCount}</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <SidebarTrigger className="md:hidden" />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="global-search"
                placeholder="Search by license plate, manufacturer, model, customer... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {currentUser?.role === "admin" && (
              <Button variant="outline" size="sm" onClick={() => setAddMechOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Mechanic
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentUser?.role === "admin" && (
              <Button onClick={() => setNewAppointmentOpen(true)} size="sm" variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Add Appointment
              </Button>
            )}
            <Button onClick={() => setNewJobOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {currentUser?.name?.slice(0, 2).toUpperCase() || "OM"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {activeNav === "active" || activeNav === "archived" ? (
            <>
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">Filters:</span>
                  {["Active", "In Progress", "Repaired", "Invoice"].map((s) => (
                    <Badge
                      key={s}
                      variant={statusFilter.includes(s as JobStatus) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setStatusFilter((prev) =>
                          prev.includes(s as JobStatus) ? prev.filter((x) => x !== s) : [...prev, s as JobStatus],
                        )
                      }}
                    >
                      {s}
                    </Badge>
                  ))}
                  {(statusFilter.length > 0 || mechanicFilter.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter([])
                        setMechanicFilter([])
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={exportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  {selectedRows.size > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <span className="text-sm text-muted-foreground">{selectedRows.size} selected</span>
                      <Button variant="outline" size="sm" onClick={bulkArchive}>
                        Archive Selected
                      </Button>
                    </>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Page size:</span>
                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRows.size === filteredJobs.length && filteredJobs.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedRows(new Set(filteredJobs.map((j) => j.id)))
                            else setSelectedRows(new Set())
                          }}
                        />
                      </TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mechanic</TableHead>
                      <TableHead>Date In</TableHead>
                      <TableHead className="text-right">Total Sale</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Margin %</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.slice(0, pageSize).map((job) => (
                      <TableRow
                        key={job.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedJob(job)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRows.has(job.id)}
                            onCheckedChange={() => toggleRowSelection(job.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-semibold">{job.licensePlate}</TableCell>
                        <TableCell>{job.manufacturer}</TableCell>
                        <TableCell>{job.model}</TableCell>
                        <TableCell>{job.serviceType}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{job.mechanicAssigned}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(job.dateIn).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">${job.totalSale.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">${job.totalCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn("font-semibold", getMarginColor(job.marginPercent))}>
                            {job.marginPercent.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedJob(job)}>Edit Job</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  updateJob(job.id, { status: "Archived" })
                                  toast({ title: "Job archived" })
                                }}
                              >
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : activeNav === "customers" ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Customer List</h2>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vehicles</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className="text-right">Lifetime Jobs</TableHead>
                      <TableHead className="text-right">Lifetime Revenue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <a href={`tel:${c.phone}`} className="text-primary hover:underline">
                            {c.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          {c.email ? (
                            <a href={`mailto:${c.email}`} className="text-primary hover:underline">
                              {c.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.vehicles.map((v) => `${v.licensePlate} (${v.manufacturer} ${v.model})`).join(", ")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(c.lastVisit).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">{c.lifetimeJobs}</TableCell>
                        <TableCell className="text-right">${c.lifetimeRevenue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "Old" ? "secondary" : "outline"}>
                            {c.status === "Old" ? "Old Customer" : "New Customer"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : activeNav === "appointments" ? (
            <AppointmentsView />
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Reporting</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">{kpis.totalJobs}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Active / In Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {kpis.active} / {kpis.inProgress}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">${kpis.totalRevenue.toFixed(2)}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Margin %</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    <span
                      className={cn(
                        kpis.overallMargin >= 40
                          ? "text-status-repaired"
                          : kpis.overallMargin >= 20
                            ? "text-status-progress"
                            : "text-status-overdue",
                      )}
                    >
                      {kpis.overallMargin.toFixed(1)}%
                    </span>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Service Type Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead className="text-right">Jobs</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceBreakdown.map((row) => (
                            <TableRow key={row.service}>
                              <TableCell>{row.service}</TableCell>
                              <TableCell className="text-right">{row.count}</TableCell>
                              <TableCell className="text-right">${row.revenue.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Monthly Revenue (Dummy)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Margin %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monthlyRevenue.map((m) => {
                            const margin = m.revenue > 0 ? ((m.revenue - m.cost) / m.revenue) * 100 : 0
                            return (
                              <TableRow key={m.month}>
                                <TableCell>{m.month}</TableCell>
                                <TableCell className="text-right">${m.revenue.toFixed(0)}</TableCell>
                                <TableCell className="text-right">${m.cost.toFixed(0)}</TableCell>
                                <TableCell className="text-right">
                                  <span
                                    className={cn(
                                      margin >= 40
                                        ? "text-status-repaired"
                                        : margin >= 20
                                          ? "text-status-progress"
                                          : "text-status-overdue",
                                    )}
                                  >
                                    {margin.toFixed(1)}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>

      {selectedJob && (
        <JobDetailSheet
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={(updates) => {
            updateJob(selectedJob.id, updates)
            setSelectedJob({ ...selectedJob, ...updates })
          }}
        />
      )}

      <NewJobDialog open={newJobOpen} onOpenChange={setNewJobOpen} />

      <Dialog open={addMechOpen} onOpenChange={setAddMechOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Mechanic</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <TextInput
              placeholder="Mechanic full name"
              value={newMechanic}
              onChange={(e) => setNewMechanic(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMechOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMechanic}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewAppointmentDialog
        open={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        mechanics={(mechanics || []).map((name: string, idx: number) => ({ id: name || String(idx), name }))}
      />
    </SidebarProvider>
  )
}

function getStatusVariant(status: JobStatus): "default" | "secondary" | "outline" | "destructive" {
  if (status === "Active") return "default"
  if (status === "In Progress") return "secondary"
  if (status === "Repaired" || status === "Invoice") return "outline"
  return "secondary"
}

function getMarginColor(margin: number): string {
  if (margin >= 40) return "text-status-repaired"
  if (margin >= 20) return "text-status-progress"
  return "text-status-overdue"
}
