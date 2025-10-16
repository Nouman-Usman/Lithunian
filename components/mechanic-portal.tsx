"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Plus, Trash2, LogOut } from "lucide-react"
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Mechanic Portal</h1>
          <span className="text-gray-600 font-medium">{currentMechanic}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 text-gray-900 placeholder:text-gray-500 h-10"
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Sign out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {mechanicJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-600 mb-2 text-lg">No jobs assigned.</p>
            <p className="text-sm text-gray-500">Pull to refresh.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mechanicJobs.map((job) => (
              <Card
                key={job.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 bg-white rounded-lg"
                onClick={() => openJob(job)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-mono text-2xl font-bold text-gray-900">{job.licensePlate}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.manufacturer} {job.model}
                      </p>
                    </div>
                    <Badge 
                      className={`font-medium text-sm px-3 py-1 ${
                        job.status === "Active" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Service Type</p>
                      <p className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1.5 rounded inline-block">
                        {job.serviceType}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-3">
                      {job.officeComment || "No office notes."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Job Detail Dialog */}
      {selectedJob && (
        <Dialog open onOpenChange={closeJob}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">Job Details — {selectedJob.licensePlate}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Car Info (Read-Only) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <p className="font-semibold text-gray-900">
                  {selectedJob.manufacturer} {selectedJob.model} ({selectedJob.year})
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Customer: {selectedJob.customerName} — {selectedJob.customerPhone}
                </p>
              </div>

              {/* Parts Ordered/Used */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold text-gray-900">Parts Ordered/Used</Label>
                  <Button 
                    size="sm" 
                    onClick={addPart}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Part
                  </Button>
                </div>
                <div className="space-y-3">
                  {parts.map((part) => (
                    <div key={part.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 uppercase">Part Name *</Label>
                          <Input
                            value={part.name}
                            onChange={(e) => updatePart(part.id, { name: e.target.value })}
                            placeholder="Part description"
                            className="border-gray-300 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 uppercase">Supplier</Label>
                          <Input
                            value={part.supplier}
                            onChange={(e) => updatePart(part.id, { supplier: e.target.value })}
                            placeholder="Optional"
                            className="border-gray-300 mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-xs font-semibold text-gray-700 uppercase">Purchase Price (Cost) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={part.cost}
                            onChange={(e) => updatePart(part.id, { cost: Number.parseFloat(e.target.value) || 0 })}
                            className="border-gray-300 mt-1"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deletePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Office calculates sale price.</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Notes */}
              <section>
                <Label className="text-base font-semibold text-gray-900">Comment From the Master *</Label>
                <Textarea
                  value={mechanicComment}
                  onChange={(e) => setMechanicComment(e.target.value)}
                  placeholder="Describe the work performed, any issues found, recommendations…"
                  rows={5}
                  className="border-gray-300 mt-2"
                />
              </section>

              {/* Time Tracking */}
              <section>
                <Label className="text-base font-semibold text-gray-900">Duration of Repair (hours)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number.parseFloat(e.target.value) || 0)}
                  className="border-gray-300 mt-2"
                />
              </section>
            </div>

            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={saveNotes}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Update Job Notes
              </Button>
              <Button 
                onClick={completeJob}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Job Completed — Move to Office Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
