"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LogOut, Menu, Wrench } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function MechanicPortal() {
  const { currentUser, logout } = useAuth()
  const [mechanicJobs, setMechanicJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mechanicComment, setMechanicComment] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetchMechanicJobs()
  }, [])

  const fetchMechanicJobs = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/mechanic/jobs")
      const data = await response.json()
      if (response.ok) {
        setMechanicJobs(data.jobs || [])
      } else {
        setError(data.message || "Failed to fetch jobs")
      }
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError("Failed to fetch jobs")
    } finally {
      setLoading(false)
    }
  }

  const openJobDetails = (job: any) => {
    setSelectedJob(job)
    setMechanicComment(job.mechanicComment || "")
    setShowJobDetail(true)
  }

  const closeJobDetails = () => {
    setShowJobDetail(false)
    setSelectedJob(null)
    setMechanicComment("")
    setError("")
    setSuccess("")
  }

  const handleSaveNotes = async () => {
    if (!selectedJob) {
      setError("No job selected")
      return
    }

    if (!mechanicComment.trim()) {
      setError("Please add work notes before saving")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diagnosis_notes: mechanicComment,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to save notes")
      }

      setSuccess("Work notes saved successfully! You can now mark the job as complete or add more details.")
      setTimeout(() => {
        setSuccess("")
      }, 4000)

      // Update the local state with the new notes
      setSelectedJob({
        ...selectedJob,
        diagnosis_notes: mechanicComment,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save notes")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteJob = async () => {
    if (!selectedJob || !mechanicComment.trim()) {
      setError("Please add work notes before marking job as complete")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "repaired",
          diagnosis_notes: mechanicComment,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to complete job")
      }

      setSuccess("Job completed and moved to office review!")
      setTimeout(() => {
        closeJobDetails()
        fetchMechanicJobs()
        setSuccess("")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Toggle Sidebar"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
              </button>
              <div className="rounded-lg bg-gray-900 p-1.5 sm:p-2 flex-shrink-0">
                <Wrench className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Mechanic Portal</h1>
            </div>

            {/* Right Section - User & Logout */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name || currentUser?.username}</p>
                <p className="text-xs text-gray-600">Mechanic</p>
              </div>
              <Button
                onClick={logout}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:px-3"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Messages */}
      {success && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-800">{success}</p>
            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your Assigned Jobs</h2>
          <p className="text-sm text-gray-600">
            {loading ? "Loading..." : `${mechanicJobs.length} job${mechanicJobs.length !== 1 ? "s" : ""} assigned`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your jobs...</p>
            </div>
          </div>
        ) : mechanicJobs.length === 0 ? (
          <Card className="border-gray-200 bg-white">
            <CardContent className="pt-12 text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">No jobs assigned to you yet</p>
              <p className="text-xs text-gray-500 mt-2">Check back later or contact your supervisor</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mechanicJobs.map((job) => (
              <Card
                key={job.id}
                className="cursor-pointer hover:shadow-lg transition-all border-gray-200 bg-white rounded-lg hover:border-blue-300"
                onClick={() => openJobDetails(job)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {job.licensePlate}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        {job.manufacturer} {job.model}
                      </p>
                    </div>
                    <Badge
                      className={`font-medium text-xs px-2 py-1 flex-shrink-0 ml-2 ${
                        job.status === "active"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {job.status === "active" ? "Active" : "In Progress"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Service Type</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                        {job.serviceType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Customer</p>
                      <p className="text-xs sm:text-sm text-gray-900 font-medium">{job.customerName}</p>
                    </div>
                    {job.officeComment && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Office Notes</p>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{job.officeComment}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Job Detail Sheet */}
      <Sheet open={showJobDetail} onOpenChange={setShowJobDetail}>
        <SheetContent className="w-full sm:max-w-2xl bg-white overflow-y-auto p-0">
          <div className="p-6 space-y-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl text-gray-900">Job Details</SheetTitle>
            </SheetHeader>

            {selectedJob && (
              <>
                {/* Vehicle Info */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Vehicle Information</h2>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">License Plate</p>
                      <p className="text-xl font-bold text-gray-900">{selectedJob.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Year</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.year || "N/A"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Model</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.model}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Service Details */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Service Details</h2>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Service Type</p>
                    <p className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {selectedJob.serviceType}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedJob.status === "active"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {selectedJob.status === "active" ? "Active" : "In Progress"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Office Notes */}
                {selectedJob.officeComment && (
                  <div className="space-y-4">
                    <h2 className="text-base font-semibold text-gray-900">Office Notes</h2>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Work Description</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {selectedJob.officeComment}
                      </p>
                    </div>
                  </div>
                )}

                {selectedJob.partsUsed && selectedJob.partsUsed.length > 0 && (
                  <>
                    <div className="border-t border-gray-200"></div>
                    <div className="space-y-4">
                      <h2 className="text-base font-semibold text-gray-900">Parts Used</h2>
                      {selectedJob.partsUsed.map((part: any) => (
                        <div key={part.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Part Name</p>
                              <p className="text-sm font-medium text-gray-900">{part.partName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Quantity</p>
                              <p className="text-sm font-medium text-gray-900">{part.qty}</p>
                            </div>
                          </div>
                          {part.supplierName && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Supplier</p>
                              <p className="text-sm text-gray-700">{part.supplierName}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200"></div>

                {/* Work Notes Section */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Your Work Notes</h2>

                  <div className="space-y-2">
                    <Label htmlFor="mechanicComment" className="text-sm text-gray-700">
                      Work Performed & Findings <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="mechanicComment"
                      value={mechanicComment}
                      onChange={(e) => setMechanicComment(e.target.value)}
                      placeholder="Describe the work performed, issues found, parts used, recommendations, etc..."
                      className="min-h-[120px] border-gray-300 text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500">Be as detailed as possible for the office review</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                  <Button
                    onClick={() => setShowJobDetail(false)}
                    variant="outline"
                    className="text-gray-900 font-medium border-gray-300"
                    disabled={loading}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleSaveNotes}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={loading || !mechanicComment.trim()}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                  <Button
                    onClick={handleCompleteJob}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Completing...
                      </div>
                    ) : (
                      "Mark Job Complete"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

