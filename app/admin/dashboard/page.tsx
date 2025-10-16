"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Menu,
  Wrench,
  LogOut,
  Briefcase,
  Archive,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  TrendingUp,
  DollarSign,
  Search,
  Plus,
  UserPlus,
  Download,
  MoreVertical,
} from "lucide-react"

const menuItems = [
  { id: "active-jobs", label: "Active Jobs", icon: Briefcase },
  { id: "archived-jobs", label: "Archived Jobs", icon: Archive },
  { id: "customers", label: "Customer List", icon: Users },
  { id: "appointments", label: "My Appointments", icon: Calendar },
  { id: "reporting", label: "Reporting", icon: BarChart3 },
  { id: "user-management", label: "User Management", icon: Users },
]

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("active-jobs")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddMechanicDialog, setShowAddMechanicDialog] = useState(false)
  const [mechanicForm, setMechanicForm] = useState({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [showUpdatePasswordDialog, setShowUpdatePasswordDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [jobFilter, setJobFilter] = useState("all")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)
  const [showEditJobDialog, setShowEditJobDialog] = useState(false)
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [editJobForm, setEditJobForm] = useState({
    serviceType: "",
    status: "",
    mechanicId: "",
    commentFromOffice: "",
    commentFromMaster: "",
    laborCost: "",
    partsCost: "",
  })

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
    } else if (activeMenu === "user-management") {
      fetchUsers()
    } else if (activeMenu === "active-jobs") {
      fetchAllJobs()
    } else if (activeMenu === "customers") {
      fetchAllCustomers()
    }
  }, [currentUser, router, activeMenu])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  const fetchAllJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      const data = await response.json()
      if (response.ok) {
        setAllJobs(data.jobs || [])
      }
    } catch (err) {
      console.error("Error fetching jobs:", err)
    }
  }

  const fetchJobDetails = async (jobId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${jobId}`)
      const data = await response.json()
      if (response.ok) {
        setSelectedJob(data)
        setShowJobDetail(true)
      } else {
        setError(data.message || "Failed to fetch job details")
      }
    } catch (err) {
      console.error("Error fetching job details:", err)
      setError("Failed to fetch job details")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllCustomers = async () => {
    try {
      const response = await fetch("/api/customer")
      const data = await response.json()
      if (response.ok) {
        setAllCustomers(data.customers || [])
      }
    } catch (err) {
      console.error("Error fetching customers:", err)
      setError("Failed to fetch customers")
    }
  }

  const exportCustomersToCSV = () => {
    if (allCustomers.length === 0) {
      setError("No customers to export")
      return
    }

    // Prepare CSV headers
    const headers = ["Name", "Phone", "Email", "Vehicles", "Last Visit", "Lifetime Jobs", "Lifetime Revenue", "Status"]
    
    // Prepare CSV rows
    const rows = allCustomers.map((customer) => [
      customer.name || "",
      customer.phone || "",
      customer.email || "",
      customer.vehicles || "",
      customer.lastVisit || "",
      customer.lifetimeJobs || 0,
      customer.lifetimeRevenue || "$0.00",
      customer.status || "New Customer",
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `customers-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setSuccess("Customer list exported successfully!")
    setTimeout(() => setSuccess(""), 3000)
  }

  // Filter jobs based on selected filter (client-side)
  const getFilteredJobs = () => {
    if (jobFilter === "all") {
      return allJobs
    }
    return allJobs.filter((job) => job.status === jobFilter)
  }

  const jobs = getFilteredJobs()

  if (!currentUser) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleAddMechanic = async () => {
    // Reset messages
    setError("")
    setSuccess("")

    // Validation
    if (!mechanicForm.username.trim()) {
      setError("Username is required")
      return
    }
    if (!mechanicForm.password.trim()) {
      setError("Password is required")
      return
    }
    if (mechanicForm.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: mechanicForm.username,
          password: mechanicForm.password,
          role: "mechanic",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to add mechanic")
        return
      }

      setSuccess(`Mechanic "${mechanicForm.username}" added successfully!`)
      setMechanicForm({ username: "", password: "" })
      
      // Close dialog after success
      setTimeout(() => {
        setShowAddMechanicDialog(false)
        setSuccess("")
        fetchUsers()
      }, 2000)
    } catch (err) {
      setError("An error occurred while adding the mechanic")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    setError("")
    setSuccess("")

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to update password")
        return
      }

      setSuccess("Password updated successfully!")
      setNewPassword("")

      // Close dialog after success
      setTimeout(() => {
        setShowUpdatePasswordDialog(false)
        setSuccess("")
        setSelectedUser(null)
        fetchUsers()
      }, 2000)
    } catch (err) {
      setError("An error occurred while updating password")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMechanic = async () => {
    // Reset messages
    setError("")
    setSuccess("")

    setLoading(true)

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to delete mechanic")
        return
      }

      setSuccess(`Mechanic "${selectedUser.username}" deleted successfully!`)

      // Close dialog after success
      setTimeout(() => {
        setShowDeleteDialog(false)
        setSuccess("")
        setSelectedUser(null)
        fetchUsers()
      }, 2000)
    } catch (err) {
      setError("An error occurred while deleting the mechanic")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          {/* Navbar Container */}
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Garage OS</h1>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                onClick={() => {}}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:px-3"
                title="New Appointment"
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">New Appointment</span>
              </Button>

              <Button
                onClick={() => {}}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:px-3"
                title="Add Job"
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Add Job</span>
              </Button>

              <Button
                onClick={() => setShowAddMechanicDialog(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:px-3"
                title="Add Mechanic"
              >
                <UserPlus className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Add Mechanic</span>
              </Button>

              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:px-3"
                title="Logout"
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

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`border-r border-gray-200 bg-gray-50 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-64" : "w-0"
          }`}
        >
          <div className="w-64 p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Navigation
            </h3>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                      activeMenu === item.id
                        ? "bg-gray-200 text-gray-900 border-l-2 border-gray-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">

        {/* Conditional Content Rendering */}
        {activeMenu === "active-jobs" ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Active Jobs</h2>
            
            {/* Filter Buttons - Wrap on mobile */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {["all", "active", "in-progress", "repaired"].map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setJobFilter(filter)}
                  variant={jobFilter === filter ? "default" : "outline"}
                  className={`text-xs sm:text-sm ${jobFilter === filter ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-gray-700 border-gray-300"}`}
                  size="sm"
                >
                  {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1).replace("-", " ")}
                </Button>
              ))}
            </div>

            {/* Export and Page Size - Stack on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 border-gray-300 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 flex-shrink-0" />
                <span>Export CSV</span>
              </Button>
              <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
                <span className="text-gray-600 whitespace-nowrap">Page size:</span>
                <select className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 flex-1 sm:flex-none">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>

            {/* Jobs Table */}
            {jobs.length === 0 ? (
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6 text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">No jobs found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left"><input type="checkbox" className="rounded" /></th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Plate</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Make</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Model</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Service</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Status</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Mechanic</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Date In</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Sale</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Cost</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Margin</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr 
                        key={job.id} 
                        onClick={() => {
                          fetchJobDetails(job.id)
                        }}
                        className="border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td className="px-3 sm:px-4 py-2 sm:py-3"><input type="checkbox" className="rounded" /></td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-gray-900">{job.licensePlate}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">{job.manufacturer}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">{job.model}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">{job.serviceType}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            job.status === "active" 
                              ? "bg-blue-100 text-blue-700" 
                              : job.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : job.status === "repaired"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">{job.mechanicName || "—"}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 whitespace-nowrap">{new Date(job.dateIn).toLocaleDateString()}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium">${job.totalSale?.toFixed(2) || "0.00"}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium">${job.totalCost?.toFixed(2) || "0.00"}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span className={job.marginPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                            {job.marginPercentage?.toFixed(1) || "0.0"}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors inline-block">
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeMenu === "user-management" ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">User Management</h2>
            
            {users.length === 0 ? (
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6 text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">No mechanics found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Username</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Role</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Name</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900">{user.username}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                            user.role === "admin" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">{user.name || "—"}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                          {user.role === "mechanic" && (
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowUpdatePasswordDialog(true)
                                  setNewPassword("")
                                }}
                                variant="outline"
                                size="sm"
                                className="text-gray-900 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                              >
                                <span className="hidden sm:inline">Update</span>
                                <span className="sm:hidden">Upd</span>
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowDeleteDialog(true)
                                }}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                              >
                                Del
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeMenu === "customers" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer List</h2>
              <Button
                onClick={exportCustomersToCSV}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs sm:text-sm"
                title="Export Customers"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
            
            {allCustomers.length === 0 ? (
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-6 text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">No customers found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Name</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Phone</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Email</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Vehicles</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Last Visit</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Lifetime Jobs</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Lifetime Revenue</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-gray-900">{customer.name}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">
                          {customer.phone ? (
                            <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                              {customer.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">
                          {customer.email ? (
                            <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                              {customer.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600">{customer.vehicles || "—"}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 whitespace-nowrap">{customer.lastVisit || "—"}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium">{customer.lifetimeJobs || 0}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-900 font-medium">{customer.lifetimeRevenue || "$0.00"}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            customer.status === "Old Customer"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Welcome, {currentUser.name}! 👋</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Here's your admin dashboard overview</p>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                      {currentUser.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                      {currentUser.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                      {currentUser.name || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">
                    Role & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Current Role</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-block h-3 w-3 rounded-full flex-shrink-0 ${
                          currentUser.role === "admin"
                            ? "bg-gray-700"
                            : "bg-gray-600"
                        }`}
                      ></span>
                      <p className="text-sm sm:text-lg font-semibold text-gray-900 capitalize">
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Permissions</p>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">
                      Full admin access with all privileges
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
          </div>
        </main>
      </div>

      {/* Update Password Dialog */}
      <Dialog open={showUpdatePasswordDialog} onOpenChange={setShowUpdatePasswordDialog}>
        <DialogContent className="w-full sm:max-w-md bg-white mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg text-gray-900">Update Password</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600">
              Update password for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            {error && (
              <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs sm:text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs sm:text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs sm:text-sm text-gray-700">
                New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="bg-white border-gray-300 text-xs sm:text-sm text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                setShowUpdatePasswordDialog(false)
                setNewPassword("")
                setSelectedUser(null)
              }}
              variant="outline"
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm bg-gray-900 hover:bg-gray-800 text-white"
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Mechanic Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-full sm:max-w-md bg-white mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg text-gray-900">Delete Mechanic</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600">
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            {error && (
              <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs sm:text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs sm:text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="p-2 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-700">
                <strong>Warning:</strong> This will permanently delete the mechanic account and all associated data.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                setShowDeleteDialog(false)
                setSelectedUser(null)
              }}
              variant="outline"
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMechanic}
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Mechanic Dialog */}
      <Dialog open={showAddMechanicDialog} onOpenChange={setShowAddMechanicDialog}>
        <DialogContent className="w-full sm:max-w-md bg-white mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg text-gray-900">Add New Mechanic</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600">
              Create a new mechanic account. Username must be unique.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            {error && (
              <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs sm:text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs sm:text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs sm:text-sm text-gray-700">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                placeholder="Enter unique username"
                value={mechanicForm.username}
                onChange={(e) =>
                  setMechanicForm({ ...mechanicForm, username: e.target.value })
                }
                disabled={loading}
                className="bg-white border-gray-300 text-xs sm:text-sm text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                Must be unique and contain only letters, numbers, and underscores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm text-gray-700">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={mechanicForm.password}
                onChange={(e) =>
                  setMechanicForm({ ...mechanicForm, password: e.target.value })
                }
                disabled={loading}
                className="bg-white border-gray-300 text-xs sm:text-sm text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setShowAddMechanicDialog(false)}
              variant="outline"
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMechanic}
              disabled={loading}
              size="sm"
              className="text-xs sm:text-sm bg-gray-900 hover:bg-gray-800 text-white"
            >
              {loading ? "Adding..." : "Add Mechanic"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Detail Sheet */}
      <Sheet open={showJobDetail} onOpenChange={setShowJobDetail}>
        <SheetContent className="w-full sm:max-w-2xl bg-white overflow-y-auto p-0">
          <div className="p-6 space-y-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl text-gray-900">Job Details</SheetTitle>
            </SheetHeader>

            {selectedJob && (
              <>
                {/* Customer & Vehicle Section */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Customer & Vehicle</h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">License Plate</p>
                      <p className="text-xl font-bold text-gray-900">{selectedJob.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer Source</p>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {selectedJob.customerSource || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Model</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Year</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.year || "N/A"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.customerName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
                        {selectedJob.customerPhone ? `📞 ${selectedJob.customerPhone}` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Parts & Pricing Section */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Parts & Pricing</h2>
                  
                  {selectedJob.partsUsed && selectedJob.partsUsed.length > 0 ? (
                    selectedJob.partsUsed.map((part: any) => (
                      <div key={part.id}>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Part Name</p>
                            <p className="text-sm font-medium text-gray-600">{part.partName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Supplier</p>
                            <p className="text-sm font-medium text-gray-600">{part.supplier || "—"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Cost</p>
                            <p className="text-sm font-medium text-gray-900">${part.cost?.toFixed(2) || "0.00"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Sale Price</p>
                            <p className="text-sm font-medium text-gray-900">${part.salePrice?.toFixed(2) || "0.00"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Margin</p>
                            <p className="text-sm font-medium text-gray-600">
                              {part.cost && part.salePrice 
                                ? ((((part.salePrice - part.cost) / part.cost) * 100).toFixed(1)) + "%"
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">No parts used</div>
                  )}
                </div>

                {/* Overall Margin Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900">Overall Margin:</p>
                    <p className={`text-lg font-bold ${selectedJob.marginPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {selectedJob.marginPercentage?.toFixed(1) || "0.0"}%
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Office Notes Section */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Office Notes</h2>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Comment From the Office</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {selectedJob.commentFromOffice || "No office notes"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">How Customer Found Us</p>
                    <p className="text-sm text-gray-700">{selectedJob.customerSource || "Not specified"}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Mechanic Input Section */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Mechanic Input</h2>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Comment From the Master</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {selectedJob.commentFromMaster || "No comments yet."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duration of Repair</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJob.durationRepair || "0h"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedJob.status === "active" 
                          ? "bg-blue-100 text-blue-700" 
                          : selectedJob.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : selectedJob.status === "repaired"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {selectedJob.status && selectedJob.status.toUpperCase() !== "REPAIRED" && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                      onClick={async () => {
                        setLoading(true)
                        setError("")
                        try {
                          const response = await fetch(`/api/jobs/${selectedJob.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              status: 'Repaired',
                            }),
                          })
                          
                          if (!response.ok) throw new Error('Failed to update status')
                          
                          setSuccess("Status updated to Repaired!")
                          setShowJobDetail(false)
                          fetchAllJobs()
                        } catch (err) {
                          setError("Failed to change status")
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Change Status to Repaired"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="text-gray-900 font-medium border-gray-300"
                    onClick={() => {
                      setEditJobForm({
                        serviceType: selectedJob.serviceType || "",
                        status: selectedJob.status || "",
                        mechanicId: selectedJob.mechanicId || "",
                        commentFromOffice: selectedJob.commentFromOffice || "",
                        commentFromMaster: selectedJob.commentFromMaster || "",
                        laborCost: selectedJob.laborCost || "",
                        partsCost: selectedJob.partsCost || "",
                      })
                      setShowEditJobDialog(true)
                    }}
                  >
                    Edit Job Details
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Job Dialog */}
      <Dialog open={showEditJobDialog} onOpenChange={setShowEditJobDialog}>
        <DialogContent className="w-full sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900">Edit Job Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update job information for {selectedJob?.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-sm text-gray-700">
                Service Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="serviceType"
                value={editJobForm.serviceType}
                onChange={(e) => setEditJobForm({ ...editJobForm, serviceType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select Service Type</option>
                <option value="General Inspection">General Inspection</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Brakes">Brakes</option>
                <option value="Transmission">Transmission</option>
                <option value="Electrical">Electrical</option>
                <option value="Bodywork">Bodywork</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm text-gray-700">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={editJobForm.status}
                onChange={(e) => setEditJobForm({ ...editJobForm, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="in-progress">In Progress</option>
                <option value="repaired">Repaired</option>
                <option value="invoice">Invoice</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Mechanic Assignment */}
            <div className="space-y-2">
              <Label htmlFor="mechanicId" className="text-sm text-gray-700">
                Assigned Mechanic
              </Label>
              <select
                id="mechanicId"
                value={editJobForm.mechanicId}
                onChange={(e) => setEditJobForm({ ...editJobForm, mechanicId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Unassigned</option>
                {users
                  .filter((user) => user.role === "mechanic")
                  .map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id.toString()}>
                      {mechanic.name || mechanic.username}
                    </option>
                  ))}
              </select>
            </div>

            {/* Office Comments */}
            <div className="space-y-2">
              <Label htmlFor="commentFromOffice" className="text-sm text-gray-700">
                Comment From Office
              </Label>
              <textarea
                id="commentFromOffice"
                value={editJobForm.commentFromOffice}
                onChange={(e) => setEditJobForm({ ...editJobForm, commentFromOffice: e.target.value })}
                placeholder="Enter office notes and discovery..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                rows={3}
              />
            </div>

            {/* Mechanic Comments */}
            <div className="space-y-2">
              <Label htmlFor="commentFromMaster" className="text-sm text-gray-700">
                Comment From Mechanic (Read-Only)
              </Label>
              <textarea
                id="commentFromMaster"
                value={editJobForm.commentFromMaster}
                disabled
                placeholder="Mechanic work notes (set by mechanic only)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                rows={3}
              />
            </div>

            {/* Labor Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laborCost" className="text-sm text-gray-700">
                  Labor Cost
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="laborCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={editJobForm.laborCost}
                    onChange={(e) => setEditJobForm({ ...editJobForm, laborCost: e.target.value })}
                    className="pl-8 bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Parts Cost */}
              <div className="space-y-2">
                <Label htmlFor="partsCost" className="text-sm text-gray-700">
                  Parts Cost
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="partsCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={editJobForm.partsCost}
                    onChange={(e) => setEditJobForm({ ...editJobForm, partsCost: e.target.value })}
                    className="pl-8 bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={() => setShowEditJobDialog(false)}
              variant="outline"
              disabled={loading}
              className="text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setLoading(true)
                setError("")
                setSuccess("")
                try {
                  const response = await fetch(`/api/jobs/${selectedJob.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      repair_type: editJobForm.serviceType,
                      status: editJobForm.status,
                      mechanic_id: editJobForm.mechanicId ? parseInt(editJobForm.mechanicId) : null,
                      complaint_notes: editJobForm.commentFromOffice,
                      labor_cost: editJobForm.laborCost ? parseFloat(editJobForm.laborCost) : 0,
                      parts_cost: editJobForm.partsCost ? parseFloat(editJobForm.partsCost) : 0,
                      total_cost: (editJobForm.laborCost ? parseFloat(editJobForm.laborCost) : 0) + (editJobForm.partsCost ? parseFloat(editJobForm.partsCost) : 0),
                    }),
                  })
                  
                  if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.message || 'Failed to update job')
                  }
                  
                  setSuccess("Job updated successfully!")
                  setShowEditJobDialog(false)
                  // Refresh jobs list
                  fetchAllJobs()
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to update job")
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
