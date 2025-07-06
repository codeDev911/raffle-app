import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Headphones,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  HelpCircle,
  Star,
} from "lucide-react"

export default function ContactPage() {
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
              💬 We're Here to Help
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Get in Touch
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                With PakRaffle
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Have questions about our raffles? Need support with your account? Our dedicated team is ready to assist
              you 24/7 with any inquiries you may have.
            </p>
          </div>

          {/* Quick Contact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{"<5min"}</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">50K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-200 text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">4.9/5</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="relative py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Send us a Message
                </h2>
                <p className="text-gray-600 text-lg">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>

              <Card className="bg-white border-gray-200 shadow-xl">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="+92 300 1234567"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300">
                        <option>Select a topic</option>
                        <option>Account Support</option>
                        <option>Payment Issues</option>
                        <option>Prize Claims</option>
                        <option>Technical Support</option>
                        <option>General Inquiry</option>
                        <option>Partnership</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <textarea
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Tell us how we can help you..."
                      ></textarea>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 text-lg font-semibold shadow-lg shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Contact Information
                </h2>
                <p className="text-gray-600 text-lg">
                  Reach out to us through any of these channels. We're always ready to help!
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Phone className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Phone Support</h3>
                        <p className="text-gray-600">+92 21 1234 5678</p>
                        <p className="text-sm text-green-600">Available 24/7</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Email Support</h3>
                        <p className="text-gray-600">support@pakraffle.com</p>
                        <p className="text-sm text-blue-600">Response within 2 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Live Chat</h3>
                        <p className="text-gray-600">Available on website</p>
                        <p className="text-sm text-purple-600">Instant responses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Office Address</h3>
                        <p className="text-gray-600">Block 5, Clifton, Karachi</p>
                        <p className="text-sm text-orange-600">Visit us Mon-Fri 9AM-6PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Media */}
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Facebook className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Twitter className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="relative py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              How Can We Help?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the category that best describes your inquiry for faster assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-green-500/25">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Account Support</h3>
                <p className="text-gray-600 mb-6">
                  Issues with login, account verification, profile updates, or password reset.
                </p>
                <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent">
                  Get Help
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-blue-500/25">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Payment Issues</h3>
                <p className="text-gray-600 mb-6">
                  Problems with payments, refunds, transaction failures, or payment method setup.
                </p>
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent">
                  Get Help
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-yellow-500/25">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Prize Claims</h3>
                <p className="text-gray-600 mb-6">
                  Questions about prize delivery, claim process, or verification requirements.
                </p>
                <Button
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                >
                  Get Help
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Quick Answers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find instant answers to the most common questions about PakRaffle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">How do I claim my prize?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Winners are automatically notified via SMS and email. Prizes are transferred directly to your
                  registered payment method within 5 minutes of the draw.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Are the draws really fair?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! All draws are conducted live and recorded. We use blockchain technology for transparency and
                  third-party auditing to ensure complete fairness.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What payment methods do you accept?</h3>
                <p className="text-gray-600 leading-relaxed">
                  We accept EasyPaisa, JazzCash, and NayaPay for both ticket purchases and prize payouts. All
                  transactions are secure and instant.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">How can I increase my chances of winning?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Each ticket has an equal chance of winning. You can increase your odds by purchasing more tickets for
                  the same draw or participating in multiple draws.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Is my personal information safe?</h3>
                <p className="text-gray-600 leading-relaxed">
                  We use military-grade encryption to protect your data and never share your information with third
                  parties without your consent.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Can I play from anywhere in Pakistan?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! PakRaffle is available nationwide. As long as you have internet access and a Pakistani mobile
                  number, you can participate from anywhere.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Hours & Location */}
      <section className="relative py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Visit Our Office
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Drop by our headquarters in Karachi for in-person support or business inquiries.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mt-1">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      PakRaffle Headquarters
                      <br />
                      Block 5, Clifton
                      <br />
                      Karachi, Sindh 75600
                      <br />
                      Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mt-1">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Office Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                      <p className="text-green-600 font-medium">24/7 Online Support Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <Card className="bg-gray-100 border-gray-200 h-96">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-gray-600 mb-2">Interactive Map</h3>
                    <p className="text-gray-500">
                      Block 5, Clifton, Karachi
                      <br />
                      Click to view directions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-green-500 to-green-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Still Have Questions?</h2>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Our support team is standing by to help you with any questions or concerns you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 border-0 shadow-xl text-lg px-8 py-4 transition-all duration-300 transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Live Chat
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent text-lg px-8 py-4 transition-all duration-300"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
