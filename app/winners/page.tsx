import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, MapPin, CheckCircle, Star } from "lucide-react"
import Image from "next/image"

// Hardcoded winners data for showcase
const winnersData = [
  {
    id: 1,
    name: "Ahmed Hassan",
    city: "Karachi",
    prizeTitle: "iPhone 15 Pro Max",
    prizeValue: 450000,
    drawnAt: "2024-01-15",
    testimonial:
      "I couldn't believe it when I got the call! PakRaffle delivered my iPhone 15 Pro Max within 2 days. Amazing service!",
    proofImage: "/placeholder.svg?height=400&width=600",
    profileImage: "/placeholder.svg?height=80&width=80",
    featured: true,
    verified: true,
  },
  {
    id: 2,
    name: "Sara Khan",
    city: "Lahore",
    prizeTitle: "Cash Prize ₨500,000",
    prizeValue: 500000,
    drawnAt: "2024-01-12",
    testimonial:
      "Won half a million rupees! The money was transferred to my JazzCash account instantly. Thank you PakRaffle!",
    proofImage: "/placeholder.svg?height=400&width=600",
    profileImage: "/placeholder.svg?height=80&width=80",
    featured: true,
    verified: true,
  },
  {
    id: 3,
    name: "Muhammad Ali",
    city: "Islamabad",
    prizeTitle: "Honda Civic 2024",
    prizeValue: 6500000,
    drawnAt: "2024-01-10",
    testimonial:
      "My dream car is now in my garage! The whole process was transparent and professional. Highly recommended!",
    proofImage: "/placeholder.svg?height=400&width=600",
    profileImage: "/placeholder.svg?height=80&width=80",
    featured: true,
    verified: true,
  },
  {
    id: 4,
    name: "Fatima Sheikh",
    city: "Karachi",
    prizeTitle: "MacBook Pro M3",
    prizeValue: 350000,
    drawnAt: "2024-01-08",
    testimonial: "Perfect for my studies! Received it in brand new condition with all accessories.",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 5,
    name: "Hassan Ahmed",
    city: "Faisalabad",
    prizeTitle: "Cash Prize ₨200,000",
    prizeValue: 200000,
    drawnAt: "2024-01-05",
    testimonial: "Used the money to expand my business. PakRaffle changed my life!",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 6,
    name: "Ayesha Malik",
    city: "Lahore",
    prizeTitle: "Samsung Galaxy S24 Ultra",
    prizeValue: 280000,
    drawnAt: "2024-01-03",
    testimonial: "Amazing phone with all the latest features. Delivery was super fast!",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 7,
    name: "Omar Khan",
    city: "Multan",
    prizeTitle: "PlayStation 5 Bundle",
    prizeValue: 150000,
    drawnAt: "2024-01-01",
    testimonial: "Got the PS5 with 3 games! My kids are so happy. Thank you PakRaffle!",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 8,
    name: "Zainab Ali",
    city: "Peshawar",
    prizeTitle: "Gold Jewelry Set",
    prizeValue: 320000,
    drawnAt: "2023-12-28",
    testimonial: "Beautiful jewelry set for my wedding! Exactly as shown in the pictures.",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 9,
    name: "Bilal Hassan",
    city: "Rawalpindi",
    prizeTitle: "Cash Prize ₨300,000",
    prizeValue: 300000,
    drawnAt: "2023-12-25",
    testimonial: "Best Christmas gift ever! The money helped me pay off my debts.",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 10,
    name: "Mariam Sheikh",
    city: "Sialkot",
    prizeTitle: "Apple Watch Series 9",
    prizeValue: 120000,
    drawnAt: "2023-12-22",
    testimonial: "Love my new Apple Watch! Tracks my fitness perfectly.",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 11,
    name: "Tariq Mahmood",
    city: "Gujranwala",
    prizeTitle: "Motorcycle - Honda 125",
    prizeValue: 280000,
    drawnAt: "2023-12-20",
    testimonial: "Now I can easily commute to work! Fuel efficient and reliable bike.",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
  {
    id: 12,
    name: "Nadia Khan",
    city: "Hyderabad",
    prizeTitle: "Home Appliances Package",
    prizeValue: 180000,
    drawnAt: "2023-12-18",
    testimonial: "Complete kitchen setup! Refrigerator, microwave, and washing machine all delivered together.",
    proofImage: "/placeholder.svg?height=250&width=400",
    profileImage: "/placeholder.svg?height=50&width=50",
    featured: false,
    verified: true,
  },
]

// Hardcoded stats
const statsData = [
  { label: "Total Winners", value: "2,847", icon: Trophy },
  { label: "Prizes Delivered", value: "₨45.2M", icon: CheckCircle },
  { label: "Cities Covered", value: "25+", icon: MapPin },
  { label: "Happy Families", value: "2,420+", icon: Star },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("PKR", "₨")
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function WinnersPage() {
  const featuredWinners = winnersData.filter((winner) => winner.featured)
  const recentWinners = winnersData.filter((winner) => !winner.featured)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Happy Winners</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real people, real prizes, real deliveries. See the proof of our commitment to transparency and fairness.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {statsData.map((stat, index) => (
            <Card key={index} className="text-center rounded-2xl shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Winners */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Winners</h2>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredWinners.map((winner) => (
              <Card key={winner.id} className="rounded-2xl shadow-xl border-0 overflow-hidden">
                <div className="relative">
                  <Image
                    src={winner.proofImage || "/placeholder.svg"}
                    alt={`${winner.name} with ${winner.prizeTitle}`}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-green-500 text-white rounded-2xl">
                    <Star className="w-3 h-3 mr-1" />
                    Featured Winner
                  </Badge>
                  {winner.verified && (
                    <Badge className="absolute top-4 right-4 bg-blue-500 text-white rounded-2xl">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Image
                      src={winner.profileImage || "/placeholder.svg"}
                      alt={winner.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{winner.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {winner.city}
                      </div>
                      <div className="flex items-center text-gray-600 mb-3">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(winner.drawnAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">{formatCurrency(winner.prizeValue)}</div>
                      <div className="text-sm text-gray-500">Prize Value</div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-2xl mt-4">
                    <h4 className="font-semibold text-green-800 mb-2">Won: {winner.prizeTitle}</h4>
                    <p className="text-green-700 italic">"{winner.testimonial}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Winners Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Winners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentWinners.map((winner) => (
              <Card
                key={winner.id}
                className="rounded-2xl shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <Image
                    src={winner.proofImage || "/placeholder.svg"}
                    alt={`${winner.name} with ${winner.prizeTitle}`}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  {winner.verified && (
                    <Badge className="absolute top-4 right-4 bg-blue-500 text-white rounded-2xl">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Image
                      src={winner.profileImage || "/placeholder.svg"}
                      alt={winner.name}
                      width={50}
                      height={50}
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{winner.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {winner.city}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Prize:</span>
                      <span className="font-semibold text-sm">{winner.prizeTitle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-bold text-green-500">{formatCurrency(winner.prizeValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Won on:</span>
                      <span className="text-sm">{formatDate(winner.drawnAt)}</span>
                    </div>
                  </div>

                  {winner.testimonial && (
                    <div className="bg-gray-50 p-3 rounded-2xl mt-4">
                      <p className="text-sm text-gray-700 italic">"{winner.testimonial}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-20 text-center">
          <Card className="rounded-2xl shadow-lg border-0 bg-green-50 border-green-200">
            <CardContent className="p-12">
              <Trophy className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-green-800 mb-4">Your Turn to Win!</h2>
              <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
                Join thousands of happy winners across Pakistan. Every raffle is fair, transparent, and guaranteed to
                deliver.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge className="bg-green-500 text-white px-6 py-3 rounded-2xl text-lg">✅ 100% Genuine Winners</Badge>
                <Badge className="bg-green-500 text-white px-6 py-3 rounded-2xl text-lg">✅ Fast Prize Delivery</Badge>
                <Badge className="bg-green-500 text-white px-6 py-3 rounded-2xl text-lg">
                  ✅ Verified Testimonials
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
