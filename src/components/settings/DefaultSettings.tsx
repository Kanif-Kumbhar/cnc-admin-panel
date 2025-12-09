"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, Settings2 } from "lucide-react"

interface DefaultSettingsProps {
  settings: Record<string, string>
}

export function DefaultSettings({ settings: initialSettings }: DefaultSettingsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    defaultReportPeriod: initialSettings.defaultReportPeriod || "7",
    autoRefreshInterval: initialSettings.autoRefreshInterval || "30",
    defaultPageSize: initialSettings.defaultPageSize || "50",
    exportFormat: initialSettings.exportFormat || "xlsx",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/settings/defaults", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast.success("Default settings saved successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save settings")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Default Values & Preferences</CardTitle>
          <CardDescription>
            Configure default values used across the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Report Defaults
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultReportPeriod">Default Report Period (days)</Label>
                <Input
                  id="defaultReportPeriod"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.defaultReportPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultReportPeriod: e.target.value })
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  Default date range for reports and analytics
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exportFormat">Default Export Format</Label>
                <Select
                  value={formData.exportFormat}
                  onValueChange={(value) =>
                    setFormData({ ...formData, exportFormat: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="exportFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Preferred format for data exports
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              UI Preferences
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="autoRefreshInterval">Auto-Refresh Interval (seconds)</Label>
                <Input
                  id="autoRefreshInterval"
                  type="number"
                  min="10"
                  max="300"
                  value={formData.autoRefreshInterval}
                  onChange={(e) =>
                    setFormData({ ...formData, autoRefreshInterval: e.target.value })
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  Dashboard will refresh every {formData.autoRefreshInterval} seconds
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPageSize">Default Page Size</Label>
                <Select
                  value={formData.defaultPageSize}
                  onValueChange={(value) =>
                    setFormData({ ...formData, defaultPageSize: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="defaultPageSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                    <SelectItem value="200">200 items</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Number of items to display per page in tables
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}