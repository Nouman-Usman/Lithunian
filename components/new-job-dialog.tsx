"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { useJobs } from "@/hooks/use-jobs"
import { useToast } from "@/hooks/use-toast"
import type { Job } from "@/lib/types"

interface NewJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewJobDialog({ open, onOpenChange }: NewJobDialogProps) {
  const { addJob, jobs, mechanics } = useJobs()
  const { toast } = useToast()

  const [licensePlate, setLicensePlate] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [cc, setCc] = useState("")
  const [kw, setKw] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [officeComment, setOfficeComment] = useState("")
  const [mechanicAssigned, setMechanicAssigned] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [foundUs, setFoundUs] = useState("Google")
  const [existingVehicle, setExistingVehicle] = useState<Job | null>(null)

  useEffect(() => {
    if (licensePlate.length >= 3) {
      const found = jobs.find((j) => j.licensePlate.toLowerCase() === licensePlate.toLowerCase())
      if (found) {
        setExistingVehicle(found)
        setManufacturer(found.manufacturer)
        setModel(found.model)
        setYear(String(found.year))
        setCustomerName(found.customerName)
        setCustomerPhone(found.customerPhone)
        setCustomerEmail(found.customerEmail || "")
      } else {
        setExistingVehicle(null)
      }
    }
  }, [licensePlate, jobs])

  function handleSubmit() {
    if (
      !licensePlate ||
      !manufacturer ||
      !model ||
      !year ||
      !serviceType ||
      !mechanicAssigned ||
      !customerName ||
      !customerPhone
    ) {
      toast({ title: "Validation error", description: "Please fill all required fields.", variant: "destructive" })
      return
    }

    const newJob: Job = {
      id: Date.now().toString(),
      licensePlate: licensePlate.toUpperCase(),
      manufacturer,
      model,
      year: Number.parseInt(year),
      cc: cc ? Number.parseInt(cc) : undefined,
      kw: kw ? Number.parseInt(kw) : undefined,
      serviceType,
      status: "Active",
      mechanicAssigned,
      dateIn: new Date().toISOString(),
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      foundUs,
      officeComment,
      mechanicComment: "",
      parts: [],
      totalCost: 0,
      totalSale: 0,
      marginPercent: 0,
      durationHours: 0,
      isOldCustomer: !!existingVehicle,
    }

    addJob(newJob)
    toast({ title: "Work order created", description: `Job ${licensePlate} created successfully.` })
    onOpenChange(false)
    resetForm()
  }

  function resetForm() {
    setLicensePlate("")
    setManufacturer("")
    setModel("")
    setYear("")
    setCc("")
    setKw("")
    setServiceType("")
    setOfficeComment("")
    setMechanicAssigned("")
    setCustomerName("")
    setCustomerPhone("")
    setCustomerEmail("")
    setFoundUs("Google")
    setExistingVehicle(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Work Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {existingVehicle && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Existing vehicle found. Prior details loaded. Customer Status: <strong>Old Customer</strong>.
              </AlertDescription>
            </Alert>
          )}

          <section>
            <h3 className="text-sm font-semibold mb-3">Car Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>
                  License Plate <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="ABC1234"
                  autoFocus
                />
              </div>
              <div>
                <Label>
                  Manufacturer <span className="text-destructive">*</span>
                </Label>
                <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
              </div>
              <div>
                <Label>
                  Model <span className="text-destructive">*</span>
                </Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div>
                <Label>
                  Year <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2020"
                  min={1980}
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label>CC (optional)</Label>
                <Input type="number" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="1600" />
              </div>
              <div>
                <Label>KW (optional)</Label>
                <Input type="number" value={kw} onChange={(e) => setKw(e.target.value)} placeholder="85" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3">Service Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>
                  Service Type <span className="text-destructive">*</span>
                </Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Inspection">General Inspection</SelectItem>
                    <SelectItem value="Oil Change">Oil Change</SelectItem>
                    <SelectItem value="Brakes">Brakes</SelectItem>
                    <SelectItem value="Transmission">Transmission</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Bodywork">Bodywork</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Comment From the Office</Label>
                <Textarea
                  value={officeComment}
                  onChange={(e) => setOfficeComment(e.target.value)}
                  placeholder="Initial problem description…"
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label>
                  Mechanic Assigned <span className="text-destructive">*</span>
                </Label>
                <Select value={mechanicAssigned} onValueChange={setMechanicAssigned}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mechanic" />
                  </SelectTrigger>
                  <SelectContent>
                    {mechanics.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <Label>
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} type="tel" />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email" />
              </div>
              <div>
                <Label>How Customer Found Us</Label>
                <Select value={foundUs} onValueChange={setFoundUs}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recommended">Recommended</SelectItem>
                    <SelectItem value="Old Customer">Old Customer</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Work Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
