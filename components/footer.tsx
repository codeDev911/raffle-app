import Link from "next/link"
import { Trophy, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-green-500 p-2 rounded-2xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                Pak<span className="text-green-500">Raffle</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Pakistan's most trusted raffle platform. Win amazing prizes with complete transparency and fairness.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-3 rounded-2xl hover:bg-green-500 transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-2xl hover:bg-green-500 transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-2xl hover:bg-green-500 transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/raffles" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  All Raffles
                </Link>
              </li>
              <li>
                <Link href="/winners" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  Recent Winners
                </Link>
              </li> 
              <li>
                <Link href="https://blog.pakraffle.com?utm=pakraffle&medium=footer" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/become-a-partner"
                  className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                >
                  Earn with Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-500" />
                <span className="text-gray-400">support@pakraffle.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-500 mt-1" />
                <span className="text-gray-400">
                  Lahore, Punjab
                  <br />
                  Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">© 2024 PakRaffle. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>🇵🇰 Made in Pakistan</span>
              <span>•</span>
              <span>100% Secure</span>
              <span>•</span>
              <span>Fair & Transparent</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
