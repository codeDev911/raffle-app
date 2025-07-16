"use client"

import {
  Users,
  TrendingUp,
  DollarSign,
  Handshake,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  BarChart3,
  Gift,
  Phone,
  Mail,
  MapPin,
  Crown,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Head from "next/head"

const SEO={
  title:"Join Partner Program and earn upto 25% in commissions",
  description:"Join our partner program and earn upto 25% in commissions with our with our generous revenue sharing model. This is big opportunity for content creators to take advantage of their audience",
  tags:"PakRaffle, lucky draw, win, raffle, iPhone 16 Pro" ,
}

export default function PartnerPage() {

  return (
    <>
      <Head>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <meta name="keywords" content={SEO.tags}/>
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO.title} />
        <meta name="twitter:description" content={SEO.description} /> 
      </Head>
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Laptop Mockup Dashboard - Centered Above Text */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              {/* Laptop Frame */}
              <div className="relative bg-gray-800 rounded-t-2xl p-4 shadow-2xl" style={{ width: "800px" }}>
                {/* Laptop Screen Bezel */}
                <div className="bg-black rounded-lg p-3">
                  {/* Dashboard Content */}
                  <div className="bg-white rounded-lg p-6 h-96 overflow-hidden">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Gift className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Partner Dashboard</h3>
                          <p className="text-sm text-gray-600">Real-time earnings overview</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Live Demo</Badge>
                    </div>

                    {/* Earnings Overview */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">Today's Earnings</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">Rs. 12,450</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +24% from yesterday
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Users className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">Referrals</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600">847</div>
                        <div className="text-xs text-blue-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +12 today
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">This Month</span>
                        </div>
                        <div className="text-xl font-bold text-purple-600">Rs. 285,750</div>
                        <div className="text-xs text-purple-600">1,247 successful referrals</div>
                      </div>
                    </div>

                    {/* Recent Purchases */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Recent Purchases via Your Links
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <Gift className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">iPhone 15 Pro Max</div>
                            <div className="text-xs text-gray-600">Entry purchased • 2 min ago</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">+Rs. 150</div>
                            <div className="text-xs text-gray-500">20% comm.</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Gift className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">MacBook Pro M3</div>
                            <div className="text-xs text-gray-600">Entry purchased • 5 min ago</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">+Rs. 200</div>
                            <div className="text-xs text-gray-500">20% comm.</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Gift className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Honda Civic 2024</div>
                            <div className="text-xs text-gray-600">Entry purchased • 8 min ago</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">+Rs. 500</div>
                            <div className="text-xs text-gray-500">25% comm.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Base */}
              <div className="bg-gray-700 h-4 rounded-b-2xl relative">
                <div className="absolute inset-x-0 top-0 h-2 bg-gray-600 rounded-b-xl"></div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-3 animate-bounce">
                <div className="text-xs text-gray-600">Live Earnings</div>
                <div className="text-lg font-bold text-green-600">Rs. 12,450</div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-3 animate-pulse">
                <div className="text-xs text-gray-600">Active Referrals</div>
                <div className="text-lg font-bold text-blue-600">847</div>
              </div>

              {/* Background Blobs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>

          {/* Hero Text Content */}
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-6">🚀 Partner Program</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Partner with Pakistan's
              <span className="text-green-500 block">Leading Raffle Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Join PakRaffle.com and earn substantial commissions by promoting exciting raffles. Get paid for every
              successful purchase through your referrals with our generous revenue sharing model.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href={`${process.env.NEXT_PUBLIC_PARTNER_APP_URL}/auth/register?utm_source=hero-section&medium=pakraffle.com&comp=become-a-partner`}>
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg">
                  <Handshake className="h-5 w-5 mr-2" />
                  Become a Partner
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-4 rounded-xl bg-transparent"
              >
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">15-25%</div>
                <div className="text-sm text-gray-600">Commission Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Partners Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Meet Our Top Earning Partners</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real partners, real earnings. See how much our top performers are making with PakRaffle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Partner 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Elite
                </Badge>
              </div>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  AH
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Ahmed Hassan</h3>
                <p className="text-sm text-gray-600 mb-4">Social Media Influencer</p>
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">Rs. 485,750</div>
                  <div className="text-xs text-green-600">Monthly Earnings</div>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">2,847</div>
                    <div className="text-xs">Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">25%</div>
                    <div className="text-xs">Commission</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Pro
                </Badge>
              </div>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  SF
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Sarah Fatima</h3>
                <p className="text-sm text-gray-600 mb-4">YouTube Creator</p>
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">Rs. 325,200</div>
                  <div className="text-xs text-blue-600">Monthly Earnings</div>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">1,626</div>
                    <div className="text-xs">Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">20%</div>
                    <div className="text-xs">Commission</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Pro
                </Badge>
              </div>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  MK
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Muhammad Khan</h3>
                <p className="text-sm text-gray-600 mb-4">Website Owner</p>
                <div className="bg-purple-50 rounded-xl p-4 mb-4">
                  <div className="text-2xl font-bold text-purple-600 mb-1">Rs. 275,850</div>
                  <div className="text-xs text-purple-600">Monthly Earnings</div>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">1,379</div>
                    <div className="text-xs">Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">20%</div>
                    <div className="text-xs">Commission</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner 4 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Starter
                </Badge>
              </div>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  ZA
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Zara Ali</h3>
                <p className="text-sm text-gray-600 mb-4">TikTok Influencer</p>
                <div className="bg-orange-50 rounded-xl p-4 mb-4">
                  <div className="text-2xl font-bold text-orange-600 mb-1">Rs. 125,400</div>
                  <div className="text-xs text-orange-600">Monthly Earnings</div>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">836</div>
                    <div className="text-xs">Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">15%</div>
                    <div className="text-xs">Commission</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Earnings Banner */}
          <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Combined Monthly Earnings</h3>
            <div className="text-5xl font-bold mb-4">Rs. 1,212,200</div>
            <p className="text-green-100 mb-6">
              Our top 4 partners alone earned over 1.2 million rupees last month. Join them today!
            </p>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-xl shadow-lg font-semibold"
            >
              <Handshake className="h-5 w-5 mr-2" />
              Start Earning Like Them
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Partner with PakRaffle?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join Pakistan's most trusted raffle platform and unlock unlimited earning potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">High Commission Rates</h3>
                <p className="text-gray-600 mb-4">
                  Earn 15-25% commission on every successful purchase through your referrals. Higher volume = Higher
                  rates!
                </p>
                <Badge className="bg-green-100 text-green-700">Up to 25% Commission</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Growing Market</h3>
                <p className="text-gray-600 mb-4">
                  Tap into Pakistan's rapidly growing online raffle market with premium products and engaged customers.
                </p>
                <Badge className="bg-blue-100 text-blue-700">50K+ Active Users</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trusted Platform</h3>
                <p className="text-gray-600 mb-4">
                  Partner with a platform that customers trust. Our transparent processes and verified winners build
                  confidence.
                </p>
                <Badge className="bg-purple-100 text-purple-700">100% Transparent</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Easy Integration</h3>
                <p className="text-gray-600 mb-4">
                  Get started in minutes with our simple referral links, banners, and marketing materials.
                </p>
                <Badge className="bg-orange-100 text-orange-700">Quick Setup</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Track your performance with detailed analytics, conversion rates, and earnings in real-time.
                </p>
                <Badge className="bg-red-100 text-red-700">Live Dashboard</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Dedicated Support</h3>
                <p className="text-gray-600 mb-4">
                  Get 24/7 support from our dedicated partner success team to maximize your earnings.
                </p>
                <Badge className="bg-green-100 text-green-700">24/7 Support</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How Partnership Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 4-step process to start earning with PakRaffle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sign Up</h3>
              <p className="text-gray-600">
                Register as a partner and get approved within 24 hours. No fees or hidden costs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get Your Links</h3>
              <p className="text-gray-600">
                Receive unique referral links and marketing materials to promote our raffles.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Promote & Share</h3>
              <p className="text-gray-600">Share raffles on social media, websites, or directly with your network.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Earn Commission</h3>
              <p className="text-gray-600">
                Get paid 15-25% commission for every successful purchase through your referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Commission Structure</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Earn more as you grow - our tiered commission system rewards top performers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-green-500 mb-4">15%</div>
                <p className="text-gray-600 mb-6">Perfect for new partners getting started</p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">0-50 referrals/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Basic marketing materials</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Email support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-300 bg-green-50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="text-4xl font-bold text-green-500 mb-4">20%</div>
                <p className="text-gray-600 mb-6">For established partners with consistent sales</p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">51-200 referrals/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Premium marketing kit</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Priority support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Monthly performance bonus</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Elite</h3>
                <div className="text-4xl font-bold text-green-500 mb-4">25%</div>
                <p className="text-gray-600 mb-6">For top-tier partners driving high volume</p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">200+ referrals/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Custom marketing materials</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600">Quarterly performance bonus</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Start Earning?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of partners already earning with PakRaffle. Start your partnership journey today and unlock
            unlimited earning potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-xl shadow-lg font-semibold"
            >
              <Handshake className="h-5 w-5 mr-2" />
              Apply Now - It's Free!
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-xl bg-transparent"
            >
              <Phone className="h-5 w-5 mr-2" />
              Schedule a Call
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">No Setup Fees</div>
              <div className="text-green-100">100% Free to Join</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Quick Approval</div>
              <div className="text-green-100">Get Started in 24 Hours</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Weekly Payouts</div>
              <div className="text-green-100">Fast & Reliable Payments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our partnership program? We're here to help!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Call Us</h3>
                <p className="text-gray-600 mb-4">Speak directly with our partnership team</p>
                <p className="text-green-600 font-semibold">+92 300 1234567</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Email Us</h3>
                <p className="text-gray-600 mb-4">Get detailed information via email</p>
                <p className="text-blue-600 font-semibold">partners@pakraffle.com</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Visit Us</h3>
                <p className="text-gray-600 mb-4">Meet us at our office</p>
                <p className="text-purple-600 font-semibold">Lahore, Pakistan</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

     
    </div>
    </>
  )
}
