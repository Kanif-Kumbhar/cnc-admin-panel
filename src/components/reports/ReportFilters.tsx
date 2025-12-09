"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface ReportFiltersProps {
  dateRange: {
    from: Date
    to: Date
  }
  onDateRangeChange: (range: { from: Date; to: Date }) => void
  selectedMachine: string
  onMachineChange: (machineId: string) => void
  machines: Array<{
    id: string
    name: string
  }>
  onQuickFilter: (type: "week" | "month") => void
}

export function ReportFilters({
  dateRange,
  onDateRangeChange,
  selectedMachine,
  onMachineChange,
  machines,
  onQuickFilter,
}: ReportFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        from: range.from,
        to: range.to,
      })
      setIsCalendarOpen(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  autoFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={{
                    from: dateRange?.from,
                    to: dateRange?.to,
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter("week")}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter("month")}
            >
              This Month
            </Button>
          </div>

          <Select value={selectedMachine} onValueChange={onMachineChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {machines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  {machine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}