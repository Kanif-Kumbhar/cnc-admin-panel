"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GripVertical, MoreVertical, Pencil, Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EditStopReasonDialog } from "./EditStopReasonDialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface StopReason {
  id: string
  reasonCode: string
  reasonText: string
  category: string
  detectionType: string
  standardDuration: number | null
  sortOrder: number
  isActive: boolean
  _count: {
    stops: number
  }
}

interface StopReasonsTableProps {
  stopReasons: StopReason[]
}

function SortableRow({
  reason,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  reason: StopReason
  onEdit: (reason: StopReason) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reason.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SAFETY: "bg-red-100 text-red-700 border-red-200",
      MECHANICAL: "bg-orange-100 text-orange-700 border-orange-200",
      MATERIAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
      QUALITY: "bg-blue-100 text-blue-700 border-blue-200",
      SETUP: "bg-purple-100 text-purple-700 border-purple-200",
      MAINTENANCE: "bg-pink-100 text-pink-700 border-pink-200",
      OPERATOR: "bg-green-100 text-green-700 border-green-200",
      OTHER: "bg-slate-100 text-slate-700 border-slate-200",
    }
    return colors[category] || colors.OTHER
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">
          {reason.reasonCode}
        </Badge>
      </TableCell>
      <TableCell className="font-medium">{reason.reasonText}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn("font-medium", getCategoryColor(reason.category))}
        >
          {reason.category}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={reason.detectionType === "AUTOMATIC" ? "default" : "secondary"}>
          {reason.detectionType}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-600">
        {reason.standardDuration
          ? `${Math.round(reason.standardDuration / 60)}m`
          : "-"}
      </TableCell>
      <TableCell className="text-center">
        <span className="text-sm text-slate-600">{reason._count.stops}</span>
      </TableCell>
      <TableCell className="text-center">
        <Switch
          checked={reason.isActive}
          onCheckedChange={() => onToggleActive(reason.id, reason.isActive)}
        />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(reason)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(reason.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function StopReasonsTable({ stopReasons: initialReasons }: StopReasonsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editReason, setEditReason] = useState<StopReason | null>(null)
  const [stopReasons, setStopReasons] = useState(initialReasons)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredReasons = stopReasons.filter(
    (reason) =>
      reason.reasonCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reason.reasonText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reason.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = stopReasons.findIndex((r) => r.id === active.id)
    const newIndex = stopReasons.findIndex((r) => r.id === over.id)

    const newOrder = arrayMove(stopReasons, oldIndex, newIndex)

    setStopReasons(newOrder)

    try {
      const response = await fetch("/api/stop-reasons/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            id: item.id,
            sortOrder: index + 1,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to reorder")

      toast.success("Stop reasons reordered successfully")
      router.refresh()
    } catch (error) {
      setStopReasons(initialReasons)
      toast.error("Failed to reorder stop reasons")
      console.error(error)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/stop-reasons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast.success(isActive ? "Stop reason disabled" : "Stop reason enabled")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update stop reason")
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/stop-reasons/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast.success("Stop reason deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete stop reason")
      console.error(error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search stop reasons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-slate-600">
              {filteredReasons.length} of {stopReasons.length} reasons
            </div>
          </div>

          <div className="rounded-lg border">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Detection</TableHead>
                    <TableHead>Standard Time</TableHead>
                    <TableHead className="text-center">Usage</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReasons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No stop reasons found
                      </TableCell>
                    </TableRow>
                  ) : (
                    <SortableContext
                      items={filteredReasons.map((r) => r.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredReasons.map((reason) => (
                        <SortableRow
                          key={reason.id}
                          reason={reason}
                          onEdit={setEditReason}
                          onDelete={setDeleteId}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </SortableContext>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </CardContent>
      </Card>

      {editReason && (
        <EditStopReasonDialog
          stopReason={editReason}
          open={!!editReason}
          onOpenChange={(open) => !open && setEditReason(null)}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this stop reason. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}