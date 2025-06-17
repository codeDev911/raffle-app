"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

interface Raffle {
  id: string
  title: string
  description: string
  longDescription?: string
  image?: string
  gallery: string[]
  price: number
  totalEntries: number
  currentEntries: number
  category: string
  featured: boolean
  status: string
  endDate: string
  specifications: string[]
  rules: string[]
}

export default function EditRafflePage({ params }: { params: { id: string } }) {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    gallery: [] as string[],
    price: "",
    totalEntries: "",
    category: "",
    featured: false,
    status: "",
    endDate: "",
    specifications: [] as string[],
    rules: [] as string[],
  })
  const [newSpec, setNewSpec] = useState("")
  const [newRule, setNewRule] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        const response = await fetch(`/api/raffles/${params.id}`)
        if (response.ok) {
          const raffleData = await response.json()
          setRaffle(raffleData)
          setFormData({
            title: raffleData.title,
            description: raffleData.description,
            longDescription: raffleData.longDescription || "",
            image: raffleData.image || "",
            gallery: raffleData.gallery || [],
            price: (raffleData.price / 100).toString(),
            totalEntries: raffleData.totalEntries.toString(),
            category: raffleData.category,
            featured: raffleData.featured,
            status: raffleData.status,
            endDate: new Date(raffleData.endDate).toISOString().slice(0, 16),
            specifications: raffleData.specifications || [],
            rules: raffleData.rules || [],
          })
        }
      } catch (error) {
        console.error("Error fetching raffle:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRaffle()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/raffles/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseInt(formData.price) * 100,
          totalEntries: Number.parseInt(formData.totalEntries),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/raffles")
      } else {
        setError(data.error || "Failed to update raffle")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const addSpecification = () => {
    if (newSpec.trim()) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, newSpec.trim()],
      })
      setNewSpec("")
    }
  }

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    })
  }

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()],
      })
      setNewRule("")
    }
  }

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Raffle Not Found</h1>
        <Link href="/admin/raffles">
          <Button>Back to Raffles</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href="/admin/raffles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raffles
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Raffle</h1>
          <p className="text-gray-600 mt-2">Update raffle details and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the basic details of your raffle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-2xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Cash">Cash Prizes</SelectItem>
                    <SelectItem value="Home">Home & Garden</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-2xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                className="rounded-2xl min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Main Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="rounded-2xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Settings */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Pricing & Settings</CardTitle>
            <CardDescription>Update pricing and raffle settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Entry (PKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="rounded-2xl"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalEntries">Total Entries *</Label>
                <Input
                  id="totalEntries"
                  type="number"
                  value={formData.totalEntries}
                  onChange={(e) => setFormData({ ...formData, totalEntries: e.target.value })}
                  className="rounded-2xl"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="rounded-2xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Featured Raffle</Label>
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>Update technical specifications or features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                className="rounded-2xl"
                placeholder="Add a specification..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecification())}
              />
              <Button type="button" onClick={addSpecification} className="rounded-2xl">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specifications.map((spec, index) => (
                <Badge key={index} variant="secondary" className="rounded-2xl">
                  {spec}
                  <button type="button" onClick={() => removeSpecification(index)} className="ml-2 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Rules & Terms</CardTitle>
            <CardDescription>Update specific rules for this raffle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                className="rounded-2xl"
                placeholder="Add a rule..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
              />
              <Button type="button" onClick={addRule} className="rounded-2xl">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.rules.map((rule, index) => (
                <Badge key={index} variant="secondary" className="rounded-2xl">
                  {rule}
                  <button type="button" onClick={() => removeRule(index)} className="ml-2 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild className="rounded-2xl">
            <Link href="/admin/raffles">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl">
            {submitting ? "Updating..." : "Update Raffle"}
          </Button>
        </div>
      </form>
    </div>
  )
}
