"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { X, Plus, Phone, Mail, Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Job, PartRow } from "@/lib/types"

interface JobDetailSheetProps {
  job: Job
  onClose: () => void
  onUpdate: (updates: Partial<Job>) => void
}

export function JobDetailSheet({ job, onClose, onUpdate }: JobDetailSheetProps) {
  const [editMode, setEditMode] = useState(false)
  const [localJob, setLocalJob] = useState(job)
  const { toast } = useToast()

  function handleSave() {
    // Recalculate totals
    const totalCost = localJob.parts.reduce((sum, p) => sum + (p.cost || 0), 0)
    const totalSale = localJob.parts.reduce((sum, p) => sum + (p.sale || 0), 0)
    const marginPercent = totalSale > 0 ? ((totalSale - totalCost) / totalSale) * 100 : 0

    onUpdate({ ...localJob, totalCost, totalSale, marginPercent })
    setEditMode(false)
    toast({ title: "Changes saved", description: "Job updated successfully." })
  }

  function addPart() {
    setLocalJob({
      ...localJob,
      parts: [...localJob.parts, { id: Date.now().toString(), name: "", supplier: "", cost: 0, sale: 0 }],
    })
  }

  function updatePart(id: string, updates: Partial<PartRow>) {
    setLocalJob({
      ...localJob,
      parts: localJob.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })
  }

  function deletePart(id: string) {
    setLocalJob({
      ...localJob,
      parts: localJob.parts.filter((p) => p.id !== id),
    })
  }

  const isDirty = JSON.stringify(localJob) !== JSON.stringify(job)

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Job Details</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Customer & Car Info */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Customer & Vehicle</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">License Plate</Label>
                  <p className="font-mono font-bold text-lg">{localJob.licensePlate}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Customer Status</Label>
                  <Badge variant="outline" className="mt-1">
                    {localJob.isOldCustomer ? "Old Customer" : "New Customer"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Manufacturer</Label>
                  <p className="font-medium">{localJob.manufacturer}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Model</Label>
                  <p className="font-medium">{localJob.model}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <p className="font-medium">{localJob.year}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer Name</Label>
                  <p className="font-medium">{localJob.customerName}</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <a
                      href={`tel:${localJob.customerPhone}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {localJob.customerPhone}
                    </a>
                  </div>
                  {localJob.customerEmail && (
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <a
                        href={`mailto:${localJob.customerEmail}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {localJob.customerEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Financial & Repair */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Parts & Pricing</h3>
              {editMode && (
                <Button size="sm" variant="outline" onClick={addPart}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Part
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {localJob.parts.map((part) => (
                <div key={part.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Part Name</Label>
                      {editMode ? (
                        <Input
                          value={part.name}
                          onChange={(e) => updatePart(part.id, { name: e.target.value })}
                          placeholder="Part description"
                        />
                      ) : (
                        <p className="text-sm font-medium">{part.name || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Supplier</Label>
                      {editMode ? (
                        <Input
                          value={part.supplier}
                          onChange={(e) => updatePart(part.id, { supplier: e.target.value })}
                          placeholder="Optional"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{part.supplier || "—"}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Cost</Label>
                      {editMode ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={part.cost}
                          onChange={(e) => updatePart(part.id, { cost: Number.parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <p className="text-sm font-medium">${part.cost.toFixed(2)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Sale Price</Label>
                      {editMode ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={part.sale}
                          onChange={(e) => updatePart(part.id, { sale: Number.parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <p className="text-sm font-medium">${part.sale.toFixed(2)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Margin</Label>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          part.sale > 0
                            ? ((part.sale - part.cost) / part.sale) * 100 >= 40
                              ? "text-status-repaired"
                              : ((part.sale - part.cost) / part.sale) * 100 >= 20
                                ? "text-status-progress"
                                : "text-status-overdue"
                            : "",
                        )}
                      >
                        {part.sale > 0 ? `${(((part.sale - part.cost) / part.sale) * 100).toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                  {editMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-destructive"
                      onClick={() => deletePart(part.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-semibold">${localJob.parts.reduce((s, p) => s + p.cost, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sale Price:</span>
                <span className="font-semibold">${localJob.parts.reduce((s, p) => s + p.sale, 0).toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Overall Margin:</span>
                <span
                  className={cn(
                    "font-bold",
                    localJob.marginPercent >= 40
                      ? "text-status-repaired"
                      : localJob.marginPercent >= 20
                        ? "text-status-progress"
                        : "text-status-overdue",
                  )}
                >
                  {localJob.marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Office Notes */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Office Notes</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Comment From the Office</Label>
                {editMode ? (
                  <Textarea
                    value={localJob.officeComment}
                    onChange={(e) => setLocalJob({ ...localJob, officeComment: e.target.value })}
                    placeholder="Describe problem, customer requests, approvals…"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm mt-1">{localJob.officeComment || "—"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs">How Customer Found Us</Label>
                {editMode ? (
                  <Select value={localJob.foundUs} onValueChange={(v) => setLocalJob({ ...localJob, foundUs: v })}>
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
                ) : (
                  <p className="text-sm mt-1">{localJob.foundUs}</p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Mechanic Input (Read-Only) */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Mechanic Input</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Comment From the Master</Label>
                <p className="text-sm mt-1 bg-muted p-3 rounded-md min-h-[60px]">
                  {localJob.mechanicComment || "No comments yet."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Duration of Repair</Label>
                  <p className="text-sm font-medium mt-1">{localJob.durationHours || 0}h</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className="mt-1">{localJob.status}</Badge>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border p-4 mt-6 flex gap-2">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={!isDirty} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setLocalJob(job)
                  setEditMode(false)
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  onUpdate({ status: "Repaired" })
                  toast({ title: "Status updated", description: "Job marked as Repaired." })
                }}
                className="flex-1"
              >
                Change Status to Repaired
              </Button>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                Edit Job Details
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
