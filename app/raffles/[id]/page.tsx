"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trophy, Clock, Star, Shield, CreditCard, Smartphone, ArrowLeft, Plus, Minus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

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
  endDate: string
  specifications: string[]
  rules: string[]
}

export default function RaffleDetailPage({ params }: { params: { id: string } }) {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [entries, setEntries] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("EASYPAISA")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch raffle data
        const raffleResponse = await fetch(`/api/raffles/${params.id}`)
        if (raffleResponse.ok) {
          const raffleData = await raffleResponse.json()
          setRaffle(raffleData)
        }

        // Check if user is authenticated
        const userResponse = await fetch("/api/auth/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!raffle || raffle.currentEntries + entries > raffle.totalEntries) {
      alert("Not enough entries available!")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: raffle?.id,
          quantity: entries,
          method: paymentMethod,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Create a form and submit to payment gateway
        const form = document.createElement("form")
        form.method = "POST"
        form.action = data.paymentUrl
        form.style.display = "none"

        // Add all payment data as hidden inputs
        Object.entries(data.paymentData).forEach(([key, value]) => {
          const input = document.createElement("input")
          input.type = "hidden"
          input.name = key
          input.value = value as string
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      } else {
        alert(data.error || "Payment initiation failed")
      }
    } catch (error) {
      alert("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Raffle Not Found</h1>
          <Link href="/raffles">
            <Button>Back to Raffles</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalCost = (raffle.price * entries) / 100
  const timeLeft = new Date(raffle.endDate).getTime() - new Date().getTime()
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 rounded-2xl">
          <Link href="/raffles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raffles
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <div className="relative">
              <Image
                src={raffle.image || "/placeholder.svg?height=500&width=600"}
                alt={raffle.title}
                width={600}
                height={500}
                className="w-full rounded-2xl shadow-lg"
              />
              {raffle.featured && (
                <Badge className="absolute top-4 left-4 bg-green-500 text-white rounded-2xl">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-2xl">
                {raffle.category}
              </Badge>
            </div>

            {/* Gallery */}
            {raffle.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {raffle.gallery.map((img, index) => (
                  <Image
                    key={index}
                    src={img || "/placeholder.svg?height=200&width=200"}
                    alt={`${raffle.title} ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">{raffle.title}</h1>
              <p className="text-xl text-gray-600">{raffle.description}</p>

              <div className="flex items-center space-x-6">
                <div className="text-3xl font-bold text-green-500">
                  {formatCurrency(raffle.price)} <span className="text-lg text-gray-500">per entry</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {daysLeft > 0 ? `${daysLeft} days left` : "Ending soon"}
                </div>
              </div>
            </div>

            {/* Progress */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {raffle.currentEntries}/{raffle.totalEntries}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(raffle.currentEntries / raffle.totalEntries) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    {raffle.totalEntries - raffle.currentEntries} entries remaining
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Entry Selection */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-green-500" />
                  Enter This Raffle
                </CardTitle>
                <CardDescription>Select number of entries and payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Entry Count */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Number of Entries</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEntries(Math.max(1, entries - 1))}
                      className="rounded-2xl"
                      disabled={entries <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={entries}
                        onChange={(e) => setEntries(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        className="text-center text-lg font-bold rounded-2xl"
                        min="1"
                        max="10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEntries(Math.min(10, entries + 1))}
                      className="rounded-2xl"
                      disabled={entries >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Maximum 10 entries per person</p>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="EASYPAISA" id="easypaisa" />
                      <Label htmlFor="easypaisa" className="flex items-center space-x-3 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">EasyPaisa</div>
                          <div className="text-sm text-gray-500">Instant payment via mobile</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="JAZZCASH" id="jazzcash" />
                      <Label htmlFor="jazzcash" className="flex items-center space-x-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-orange-600" />
                        <div>
                          <div className="font-medium">JazzCash</div>
                          <div className="text-sm text-gray-500">Secure mobile payment</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Total Cost */}
                <div className="bg-green-50 p-4 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Cost:</span>
                    <span className="text-2xl font-bold text-green-500">₹{totalCost.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {entries} {entries === 1 ? "entry" : "entries"} × {formatCurrency(raffle.price)} each
                  </p>
                </div>

                {/* Enter Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl py-6 text-lg font-medium"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  {submitting ? "Processing..." : `Enter Raffle - Pay ₹${totalCost.toLocaleString()}`}
                </Button>

                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-1" />
                  100% Secure Payment
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100 p-1">
              <TabsTrigger value="description" className="rounded-2xl">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-2xl">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="rules" className="rounded-2xl">
                Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <Card className="rounded-2xl shadow-lg border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">About This Prize</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {raffle.longDescription || raffle.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <Card className="rounded-2xl shadow-lg border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
                  <ul className="space-y-3">
                    {raffle.specifications.map((spec, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="mt-8">
              <Card className="rounded-2xl shadow-lg border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Raffle Rules & Terms</h3>
                  <ul className="space-y-3">
                    {raffle.rules.map((rule, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
