import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Users,
  Shield,
  Smartphone,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  TrendingUp,
  Award,
  Clock,
  Target,
  Zap,
  CreditCard,
  Lock,
  Sparkles,
  Eye,
  Heart,
} from "lucide-react"
import Video_Mockup from "@/components/Video_Mockup"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/5 to-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-green-600/8 to-lime-500/8 rounded-full blur-2xl"></div>
      </div>

      {/* Hero Section - KEEPING AS IS */}
      <section className="relative py-20 max-w-7xl mx-auto px-6 min-h-screen flex items-center">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 transition-colors">
                🎉 Trusted by 50,000+ Pakistanis
              </Badge>

              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    MAKE DREAMS
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                    COME TRUE
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Pakistan's most sophisticated raffle platform. Where every ticket is a chance to transform your life
                  with instant wins and life-changing prizes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-xl shadow-green-500/25 text-lg px-8 py-4 transition-all duration-300 transform hover:scale-105"
                >
                  Start Playing Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent text-lg px-8 py-4 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Live Draw
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-green-500 mb-1">₨2M+</div>
                  <div className="text-sm text-gray-500">Prizes Won</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500 mb-1">50K+</div>
                  <div className="text-sm text-gray-500">Active Players</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500 mb-1">24/7</div>
                  <div className="text-sm text-gray-500">Live Draws</div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-[3rem] blur-2xl scale-110"></div>

                {/* Phone Container */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-[3rem] p-2 shadow-2xl">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2.5rem] p-6 w-80 h-[600px]">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-8 text-gray-900 text-sm">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-gray-900 rounded-sm"></div>
                        <div className="w-1 h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-6 h-2 bg-gray-900 rounded-sm"></div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-gray-500 text-sm mb-2">Hi Ahmed 👋</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">₨ 125,450.00</div>
                        <div className="text-green-500 text-sm">+₨50,000 from last win 🎉</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-500/10 rounded-2xl p-4 text-center border border-green-500/20">
                          <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs text-gray-600">Buy Tickets</div>
                        </div>
                        <div className="bg-gray-100 rounded-2xl p-4 text-center border border-gray-200">
                          <div className="w-8 h-8 bg-gray-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs text-gray-600">Live Draws</div>
                        </div>
                        <div className="bg-gray-100 rounded-2xl p-4 text-center border border-gray-200">
                          <div className="w-8 h-8 bg-gray-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs text-gray-600">My Wins</div>
                        </div>
                      </div>

                      {/* Current Raffles */}
                      <div className="space-y-3">
                        <div className="text-gray-900 font-semibold text-sm">Live Raffles</div>
                        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-2xl p-4 border border-green-500/20">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-gray-900 font-medium">iPhone 15 Pro</div>
                            <div className="text-green-500 text-sm">₨500</div>
                          </div>
                          <div className="text-gray-500 text-xs mb-3">Draw in 2h 45m</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-gray-900 font-medium">Cash Prize ₨100K</div>
                            <div className="text-gray-500 text-sm">₨200</div>
                          </div>
                          <div className="text-gray-500 text-xs mb-3">Draw in 5h 12m</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-400 h-2 rounded-full w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Bento Grid Stats Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-gray-50 via-white to-green-50/30">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Live Statistics
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Real-Time Impact
            </h2>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Large Card - Total Winnings */}
            <div className="lg:col-span-2 lg:row-span-2">
              <Card className="h-full bg-gradient-to-br from-green-500 to-green-600 border-0 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold opacity-90">Total Winnings</h3>
                        <p className="text-sm opacity-70">All time payouts</p>
                      </div>
                    </div>
                    <div className="text-5xl lg:text-6xl font-bold mb-4">₨2.5M+</div>
                    <div className="flex items-center gap-2 text-green-100">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+₨125K this week</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="text-sm opacity-70 mb-2">Weekly Growth</div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Players */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">50K+</div>
                    <div className="text-sm text-gray-500">Active Players</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+12% this month</span>
                </div>
              </CardContent>
            </Card>

            {/* Daily Winners */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">1,200+</div>
                    <div className="text-sm text-gray-500">Daily Winners</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">98% satisfaction</span>
                </div>
              </CardContent>
            </Card>

            {/* Live Draws */}
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Live Now</div>
                    <div className="text-sm opacity-80">24/7 Draws</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Next draw in 15 min</span>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">1:50</div>
                    <div className="text-sm text-gray-500">Win Rate</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Revolutionary Payment Section */}
      <section className="relative py-32 px-6 bg-white overflow-hidden">
        <div className="absolute"></div>
        <div className="container max-w-7xl  mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Content Side */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium">
                  <CreditCard className="w-4 h-4" />
                  Instant Payments
                </div>
                <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Lightning Fast
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                    Payments
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Experience the future of payments with our integrated system. Secure, instant, and hassle-free
                  transactions with Pakistan's most trusted payment partners.
                </p>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                  <img className="w-24 mx-auto" src="    https://crystalpng.com/wp-content/uploads/2024/10/Easypaisa-logo.png" alt="Easypaisa" />
                    <h3 className="font-bold text-sm text-gray-900">EasyPaisa</h3>
                    <p className="text-xs text-gray-600 mt-1">Instant</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                     <img className="w-24 mx-auto" src="https://crystalpng.com/wp-content/uploads/2024/12/new-Jazzcash-logo.png" alt="Jazzcash" />
                    <h3 className="font-bold text-sm text-gray-900">JazzCash</h3>
                    <p className="text-xs text-gray-600 mt-1">Reliable</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                  <img className="w-24 mx-auto" src=" https://vectorseek.com/wp-content/uploads/2023/09/NayaPay-Icon-Logo-Vector.svg-.png" alt="Nayapay" />
                    <h3 className="font-bold text-sm text-gray-900">NayaPay</h3>
                    <p className="text-xs text-gray-600 mt-1">Modern</p>
                  </CardContent>
                </Card>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300">
                  <div className="p-2 bg-green-500 rounded-xl">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Instant Processing</h4>
                    <p className="text-sm text-gray-600">Payments processed in under 5 seconds</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bank-Level Security</h4>
                    <p className="text-sm text-gray-600">256-bit SSL encryption for all transactions</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300">
                  <div className="p-2 bg-purple-500 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Zero Hidden Fees</h4>
                    <p className="text-sm text-gray-600">What you see is what you pay</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Side */}
            <div className="relative">
             <Video_Mockup/>
          </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-gray-50 via-white to-green-50/20">
        <div className="container max-w-7xl  mx-auto">
          <div className="text-center  mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Why Choose Us
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Built for Winners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience next-generation raffle technology with unmatched security, transparency, and user experience.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-green-500/25">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Military-Grade Security</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Your data and transactions are protected with the same encryption used by banks and government
                  institutions.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-blue-500/25">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Complete Transparency</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Every draw is live-streamed and recorded. Blockchain verification ensures fairness and builds trust
                  with our community.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>View live draws</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-purple-500/25">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Lightning Payouts</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Winners receive their prizes instantly through automated systems. No waiting, no delays, just instant
                  gratification.
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  <span>See payout speed</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-yellow-500/25">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Premium Prizes</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  From luxury cars to million-rupee cash prizes. We partner with top brands to offer life-changing
                  rewards.
                </p>
                <div className="flex items-center text-yellow-600 font-medium">
                  <span>Browse prizes</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-pink-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Community First</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Join 50,000+ happy players in Pakistan's most trusted raffle community. Real people, real wins, real
                  stories.
                </p>
                <div className="flex items-center text-pink-600 font-medium">
                  <span>Join community</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-indigo-500/25">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Mobile Excellence</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Optimized for mobile with intuitive design, offline capabilities, and push notifications for live
                  draws.
                </p>
                <div className="flex items-center text-indigo-600 font-medium">
                  <span>Download app</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials with Modern Design */}
      <section className="relative py-32 px-6 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/3 via-transparent to-blue-500/3"></div>
        <div className="container mx-auto relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Success Stories
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Life-Changing Wins
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real winners who transformed their lives with PakRaffle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="group bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                  "Won ₨500,000 in my second week! The instant payout through JazzCash was incredible. PakRaffle
                  completely changed my life."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">Ahmed Hassan</div>
                    <div className="text-gray-600">Karachi • Software Engineer</div>
                    <div className="text-sm text-green-600 font-medium mt-1">Won ₨500,000</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="group bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                  "The most trustworthy platform in Pakistan. Won multiple prizes and every payout was instant. Highly
                  recommended to everyone!"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    S
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">Sara Khan</div>
                    <div className="text-gray-600">Lahore • Teacher</div>
                    <div className="text-sm text-blue-600 font-medium mt-1">Multiple Winner</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="group bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                  "Won a brand new iPhone 15 Pro Max! The live draw was transparent and the prize delivery was perfect.
                  Amazing experience!"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    M
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">Muhammad Ali</div>
                    <div className="text-gray-600">Islamabad • Business Owner</div>
                    <div className="text-sm text-purple-600 font-medium mt-1">Won iPhone 15 Pro</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-40 translate-y-40"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Start Your Journey
            </div>
            <h2 className="text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              Your Dreams Are
              <br />
              <span className="text-green-100">One Ticket Away</span>
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed mb-12">
              Join thousands of winners today and start your journey to life-changing prizes. The next big win could be
              yours!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 border-0 shadow-2xl text-xl px-12 py-6 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                <Trophy className="w-6 h-6 mr-3" />
                Start Playing Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent text-xl px-12 py-6 transition-all duration-300 backdrop-blur-sm"
              >
                Watch Live Draws
                <Play className="w-6 h-6 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
