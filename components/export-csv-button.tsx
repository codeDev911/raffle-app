"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface ExportCSVButtonProps {
  data: any[]
  filename: string
  headers: { key: string; label: string }[]
}

export function ExportCSVButton({ data, filename, headers }: ExportCSVButtonProps) {
  const exportToCSV = () => {
    try {
      // Create CSV content
      const csvHeaders = headers.map((h) => h.label).join(",")
      const csvRows = data.map((item) =>
        headers
          .map((header) => {
            const value = getNestedValue(item, header.key)
            // Escape commas and quotes in CSV
            return typeof value === "string" && (value.includes(",") || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value || ""
          })
          .join(","),
      )

      const csvContent = [csvHeaders, ...csvRows].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`${filename} exported successfully`)
    } catch (error) {
      toast.error("Failed to export data")
      console.error("Export error:", error)
    }
  }

  // Helper function to get nested object values
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  return (
    <Button onClick={exportToCSV} variant="outline" className="rounded-2xl">
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
