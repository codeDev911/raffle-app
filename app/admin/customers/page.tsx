"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Mail, Phone, MapPin, Calendar, DollarSign, Trophy, Eye, MoreHorizontal } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ExportCSVButton } from "@/components/export-csv-button"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  createdAt: string
  isActive: boolean
  _count: {
    entries: number
    winners: number
  }
  totalSpent: number
  lastActivity: string
}

interface CustomerStats {
  totalCustomers: number
  activeThisMonth: number
  totalRevenue: number
  vipCustomers: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeThisMonth: 0,
    totalRevenue: 0,
    vipCustomers: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, statusFilter])

  const fetchCustomers = async () => {
    try {
      console.log("Fetching customers from API...") // Debug log
      const response = await fetch("/api/admin/customers")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received data:", data) // Debug log

      setCustomers(data.customers || [])
      setStats(
        data.stats || {
          totalCustomers: 0,
          activeThisMonth: 0,
          totalRevenue: 0,
          vipCustomers: 0,
        },
      )
      setError(null)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError("Failed to fetch customers. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.city?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "All") {
      if (statusFilter === "Active") {
        filtered = filtered.filter((customer) => customer.isActive)
      } else if (statusFilter === "VIP") {
        filtered = filtered.filter((customer) => customer.totalSpent >= 500000) // 5000 PKR threshold
      } else if (statusFilter === "Inactive") {
        filtered = filtered.filter((customer) => !customer.isActive)
      }
    }

    setFilteredCustomers(filtered)
  }

  const customerStats = [
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      change: "+324",
      icon: Users,
    },
    {
      title: "Active This Month",
      value: stats.activeThisMonth.toLocaleString(),
      change: "+12%",
      icon: Calendar,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+18%",
      icon: DollarSign,
    },
    {
      title: "VIP Customers",
      value: stats.vipCustomers.toString(),
      change: "+8",
      icon: Trophy,
    },
  ]

  const csvHeaders = [
    { key: "id", label: "Customer ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "city", label: "City" },
    { key: "totalSpent", label: "Total Spent (PKR)" },
    { key: "_count.entries", label: "Total Entries" },
    { key: "_count.winners", label: "Wins" },
    { key: "createdAt", label: "Join Date" },
    { key: "isActive", label: "Status" },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading customers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-lg text-red-600">{error}</div>
        <Button onClick={fetchCustomers}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all your customers and their activities</p>
        </div>
        <ExportCSVButton data={filteredCustomers} filename="customers" headers={csvHeaders} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerStats.map((stat, index) => (
          <Card key={index} className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-2xl">
                  <stat.icon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge className="bg-green-100 text-green-700 rounded-2xl">{stat.change}</Badge>
                <span className="text-sm text-gray-600 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10 rounded-2xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["All", "Active", "VIP", "Inactive"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-red-500" />
            Customers ({filteredCustomers.length})
          </CardTitle>
          <CardDescription>Complete list of registered customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Wins</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const isVIP = customer.totalSpent >= 500000 // 5000 PKR threshold
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="truncate max-w-[150px]">{customer.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.city && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{customer.city}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-2xl">
                        {customer._count.entries}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">{formatCurrency(customer.totalSpent)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="font-medium">{customer._count.winners}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-2xl ${
                          isVIP
                            ? "bg-yellow-100 text-yellow-700"
                            : customer.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isVIP ? "VIP" : customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{formatDate(new Date(customer.createdAt))}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "All"
                  ? "Try adjusting your search or filters"
                  : "Customers will appear here once they register"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
