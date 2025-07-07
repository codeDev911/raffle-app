import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Users,
  Shield,
  Heart,
  Star,
  ArrowRight,
  Zap,
  Award,
  Globe,
  TrendingUp,
  Sparkles,
  Eye,
  Handshake,
  Lightbulb,
  Rocket,
  Building,
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/5 to-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-green-600/8 to-lime-500/8 rounded-full blur-2xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 transition-colors mb-6">
              🏆 About PakRaffle
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Transforming Dreams
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                Into Reality
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              We're Pakistan's most trusted raffle platform, dedicated to creating life-changing opportunities for
              everyone. Since our inception, we've been committed to fairness, transparency, and making dreams come true
              across the nation.
            </p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">2023</div>
                <div className="text-sm text-gray-600">Founded</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-sm text-gray-600">Happy Users</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">₨2.5M+</div>
                <div className="text-sm text-gray-600">Prizes Delivered</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">25+</div>
                <div className="text-sm text-gray-600">Cities Covered</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Side */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Rocket className="w-4 h-4" />
                  Our Journey
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  From Vision to Reality
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  PakRaffle was born from a simple yet powerful vision: to create a platform where every Pakistani has
                  an equal opportunity to win life-changing prizes through fair and transparent raffles.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mt-1">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">The Idea</h3>
                    <p className="text-gray-600">
                      Founded by a team of tech enthusiasts who believed that everyone deserves a chance at winning big,
                      regardless of their background or location in Pakistan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mt-1">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">The Foundation</h3>
                    <p className="text-gray-600">
                      We built our platform on three core pillars: transparency through live draws, security through
                      advanced encryption, and accessibility through mobile-first design.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mt-1">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">The Growth</h3>
                    <p className="text-gray-600">
                      From our first winner in Karachi to thousands of happy families across Pakistan, we've grown into
                      the nation's most trusted raffle platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Our Mission</h3>
                    <p className="text-green-100 leading-relaxed">
                      To democratize opportunity by providing every Pakistani with fair access to life-changing prizes
                      through transparent, secure, and exciting raffle experiences.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-sm text-green-100">Transparent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">24/7</div>
                        <div className="text-sm text-green-100">Available</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              What Drives Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values shape every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-green-500/25">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Transparency</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every draw is live-streamed, recorded, and verifiable. We believe in complete openness in all our
                  operations.
                </p>
              </CardContent>
            </Card>

            {/* Value 2 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-blue-500/25">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bank-level encryption and security measures protect every transaction and personal information on our
                  platform.
                </p>
              </CardContent>
            </Card>

            {/* Value 3 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-purple-500/25">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Fairness</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every participant has an equal chance to win. Our algorithms are audited and certified for complete
                  fairness.
                </p>
              </CardContent>
            </Card>

            {/* Value 4 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-yellow-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're building more than a platform - we're creating a community of dreamers and winners across
                  Pakistan.
                </p>
              </CardContent>
            </Card>

            {/* Value 5 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-pink-500/25">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  We continuously innovate to provide the best user experience and introduce new ways to win amazing
                  prizes.
                </p>
              </CardContent>
            </Card>

            {/* Value 6 */}
            <Card className="group bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-indigo-500/25">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Integrity</h3>
                <p className="text-gray-600 leading-relaxed">
                  We operate with the highest ethical standards and always put our users' interests first in everything
                  we do.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Meet Our Team
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              The People Behind PakRaffle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team of experts is passionate about creating the best raffle experience for Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                  AH
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Ahmed Hassan</h3>
                <p className="text-green-600 font-medium mb-4">CEO & Founder</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Visionary leader with 10+ years in fintech, passionate about democratizing opportunities for all
                  Pakistanis.
                </p>
              </CardContent>
            </Card>

            {/* Team Member 2 */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                  SK
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Sara Khan</h3>
                <p className="text-blue-600 font-medium mb-4">CTO</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tech expert ensuring our platform's security and scalability with cutting-edge blockchain technology.
                </p>
              </CardContent>
            </Card>

            {/* Team Member 3 */}
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                  MA
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Muhammad Ali</h3>
                <p className="text-purple-600 font-medium mb-4">Head of Operations</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Operations specialist ensuring smooth prize delivery and customer satisfaction across Pakistan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="relative py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Our Achievements
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Milestones & Recognition
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Best Fintech</h3>
                <p className="text-sm text-gray-600">Pakistan Digital Awards 2024</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">4.9/5 Rating</h3>
                <p className="text-sm text-gray-600">User Satisfaction Score</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ISO Certified</h3>
                <p className="text-sm text-gray-600">Security & Quality Standards</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">National Reach</h3>
                <p className="text-sm text-gray-600">All Major Cities Covered</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-40 translate-y-40"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Join Our Journey
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
              Ready to Be Part of
              <br />
              <span className="text-green-100">Something Amazing?</span>
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed mb-12">
              Join thousands of winners and be part of Pakistan's most trusted raffle community. Your dream prize is
              just one ticket away!
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
                Contact Us
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
