"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Plus, Trash2 } from "lucide-react"
import { useJobs } from "@/hooks/use-jobs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import type { Job, PartRow } from "@/lib/types"

export function MechanicPortal() {
  const { currentUser, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [mechanicComment, setMechanicComment] = useState("")
  const [durationHours, setDurationHours] = useState(0)
  const [parts, setParts] = useState<PartRow[]>([])
  const { jobs, updateJob } = useJobs()
  const { toast } = useToast()

  const currentMechanic = currentUser?.role === "mechanic" ? currentUser.name : ""

  const mechanicJobs = jobs.filter(
    (j) =>
      !!currentMechanic &&
      j.mechanicAssigned === currentMechanic &&
      (j.status === "In Progress" || j.status === "Active") &&
      (searchQuery ? j.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) : true),
  )

  function openJob(job: Job) {
    setSelectedJob(job)
    setMechanicComment(job.mechanicComment || "")
    setDurationHours(job.durationHours || 0)
    setParts(job.parts.length > 0 ? job.parts : [])
  }

  function closeJob() {
    setSelectedJob(null)
    setMechanicComment("")
    setDurationHours(0)
    setParts([])
  }

  function addPart() {
    setParts([...parts, { id: Date.now().toString(), name: "", supplier: "", cost: 0, sale: 0 }])
  }

  function updatePart(id: string, updates: Partial<PartRow>) {
    setParts(parts.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  function deletePart(id: string) {
    setParts(parts.filter((p) => p.id !== id))
  }

  function saveNotes() {
    if (!selectedJob) return
    updateJob(selectedJob.id, { mechanicComment, durationHours, parts })
    toast({ title: "Notes updated", description: "Your work notes have been saved." })
  }

  function completeJob() {
    if (!selectedJob) return
    if (!mechanicComment.trim()) {
      toast({
        title: "Work notes required",
        description: "Please describe the work performed.",
        variant: "destructive",
      })
      return
    }
    const missingCost = parts.some((p) => p.name && !p.cost)
    if (missingCost) {
      toast({ title: "Missing cost", description: "Please enter cost for all parts.", variant: "destructive" })
      return
    }
    updateJob(selectedJob.id, { status: "Repaired", mechanicComment, durationHours, parts })
    toast({ title: "Job completed", description: "Job moved to Office Review." })
    closeJob()
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Mechanic Portal</h1>
          <Badge variant="secondary">{currentMechanic}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48"
            />
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      {/* Job Cards */}
      <main className="p-4 space-y-3">
        {mechanicJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No jobs assigned.</p>
            <p className="text-sm text-muted-foreground">Pull to refresh.</p>
          </div>
        ) : (
          mechanicJobs.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => openJob(job)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-lg font-bold">{job.licensePlate}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.manufacturer} {job.model}
                    </p>
                  </div>
                  <Badge variant={job.status === "In Progress" ? "secondary" : "default"}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2">Service Type</p>
                <Badge variant="outline" className="mb-3">
                  {job.serviceType}
                </Badge>
                <p className="text-sm line-clamp-2 text-muted-foreground">{job.officeComment || "No office notes."}</p>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {/* Job Detail Dialog */}
      {selectedJob && (
        <Dialog open onOpenChange={closeJob}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Details — {selectedJob.licensePlate}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Car Info (Read-Only) */}
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-semibold">
                  {selectedJob.manufacturer} {selectedJob.model} ({selectedJob.year})
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Customer: {selectedJob.customerName} — {selectedJob.customerPhone}
                </p>
              </div>

              {/* Parts Ordered/Used */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <Label>Parts Ordered/Used</Label>
                  <Button size="sm" variant="outline" onClick={addPart}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Part
                  </Button>
                </div>
                <div className="space-y-2">
                  {parts.map((part) => (
                    <div key={part.id} className="border border-border rounded-md p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Part Name *</Label>
                          <Input
                            value={part.name}
                            onChange={(e) => updatePart(part.id, { name: e.target.value })}
                            placeholder="Part description"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Supplier</Label>
                          <Input
                            value={part.supplier}
                            onChange={(e) => updatePart(part.id, { supplier: e.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Purchase Price (Cost) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={part.cost}
                            onChange={(e) => updatePart(part.id, { cost: Number.parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deletePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Office calculates sale price.</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Notes */}
              <section>
                <Label>Comment From the Master *</Label>
                <Textarea
                  value={mechanicComment}
                  onChange={(e) => setMechanicComment(e.target.value)}
                  placeholder="Describe the work performed, any issues found, recommendations…"
                  rows={5}
                />
              </section>

              {/* Time Tracking */}
              <section>
                <Label>Duration of Repair (hours)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number.parseFloat(e.target.value) || 0)}
                />
              </section>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={saveNotes}>
                Update Job Notes
              </Button>
              <Button onClick={completeJob}>Job Completed — Move to Office Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
