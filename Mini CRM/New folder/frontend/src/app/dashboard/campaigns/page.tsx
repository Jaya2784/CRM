"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Mail,
  Search,
  Calendar,
  Users,
  BarChart,
  Play,
  Pause,
  StopCircle,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  description: string
  status: "draft" | "active" | "paused" | "completed"
  targetSegment?: string
  startDate?: string
  endDate?: string
  metrics?: {
    sent: number
    opened: number
    clicked: number
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<Campaign["status"]>("draft")
  const [targetSegment, setTargetSegment] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("campaigns")
    if (stored) setCampaigns(JSON.parse(stored))
  }, [])

  const persist = (updated: Campaign[]) => {
    setCampaigns(updated)
    localStorage.setItem("campaigns", JSON.stringify(updated))
  }

  const openCreate = () => {
    setEditingId(null)
    setName("")
    setDescription("")
    setStatus("draft")
    setTargetSegment("")
    setStartDate("")
    setEndDate("")
    setDialogOpen(true)
  }

  const openEdit = (c: Campaign) => {
    setEditingId(c.id)
    setName(c.name)
    setDescription(c.description)
    setStatus(c.status)
    setTargetSegment(c.targetSegment || "")
    setStartDate(c.startDate || "")
    setEndDate(c.endDate || "")
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!name || !description) {
      alert("Please fill in name and description")
      return
    }

    const base: Campaign = {
      id: editingId || Date.now().toString(),
      name,
      description,
      status,
      targetSegment,
      startDate,
      endDate,
      metrics: editingId
        ? campaigns.find((c) => c.id === editingId)!.metrics
        : { sent: 0, opened: 0, clicked: 0 },
    }

    let updated: Campaign[]
    if (editingId) {
      updated = campaigns.map((c) => (c.id === editingId ? base : c))
    } else {
      updated = [...campaigns, base]
    }

    persist(updated)
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this campaign?")) return
    persist(campaigns.filter((c) => c.id !== id))
  }

  const handleStatusChange = (campaignId: string, newStatus: Campaign["status"]) => {
    const validTransitions: Record<Campaign["status"], Campaign["status"][]> = {
      draft: ["active"],
      active: ["paused", "completed"],
      paused: ["active", "completed"],
      completed: [],
    }
    const updated = campaigns.map((c) => {
      if (c.id !== campaignId) return c
      if (!validTransitions[c.status].includes(newStatus)) {
        alert(`Can't go from ${c.status} → ${newStatus}`)
        return c
      }
      return { ...c, status: newStatus }
    })
    persist(updated)
  }

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your marketing campaigns</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <BarChart className="mr-2 h-4 w-4" />
          Analytics
        </Button>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-sm text-muted-foreground">
            {campaigns.length ? "No match found" : "No campaigns yet"}
          </p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="relative group">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{c.name}</CardTitle>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(c)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* status + controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getStatusColor(
                          c.status
                        )}`}
                      />
                      <span className="capitalize text-sm">{c.status}</span>
                    </div>
                    <div className="flex space-x-1">
                      {c.status === "draft" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(c.id, "active")
                          }
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {c.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(c.id, "paused")
                          }
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {c.status === "paused" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(c.id, "active")
                          }
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {c.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(c.id, "completed")
                          }
                        >
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* dates & segment */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {c.startDate || "—"} – {c.endDate || "—"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{c.targetSegment || "All Customers"}</span>
                    </div>
                  </div>

                  {/* metrics */}
                  {c.metrics && (
                    <div className="grid grid-cols-3 gap-2 bg-muted p-2 rounded">
                      {(["sent", "opened", "clicked"] as const).map((k) => (
                        <div key={k} className="text-center">
                          <div className="font-medium">{c.metrics![k]}</div>
                          <div className="text-xs text-muted-foreground">
                            {k.charAt(0).toUpperCase() + k.slice(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* create/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Campaign" : "Create New Campaign"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your campaign settings"
                : "Define a new marketing campaign"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v: Campaign["status"]) => setStatus(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Segment</Label>
              <Select
                value={targetSegment}
                onValueChange={setTargetSegment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="high-value">
                    High-Value Customers
                  </SelectItem>
                  <SelectItem value="new">New Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
