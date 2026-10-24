"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Gift,
  Settings,
  Trophy,
  Shield,
  Loader2,
} from "lucide-react"

interface UserType {
  id: string
  name: string
  email: string
  phone?: string | null
  city?: string | null
}

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setFormData((prev) => ({
            ...prev,
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            city: userData.city || "",
          }))
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Password validation if attempting to change password
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ text: "New password must be at least 6 characters long.", type: "error" })
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ text: "New passwords do not match. Please verify.", type: "error" })
        return
      }
      if (!formData.currentPassword) {
        setMessage({ text: "Please enter your current password to authorize password update.", type: "error" })
        return
      }
    }

    setSaving(true)

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          city: formData.city || null,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ text: "Your profile information has been successfully updated!", type: "success" })
        setUser((prev) => (prev ? { ...prev, name: formData.name, email: formData.email, phone: formData.phone, city: formData.city } : null))
        // Clear sensitive password inputs
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      } else {
        setMessage({ text: data.error || "Failed to update profile. Please verify your details.", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Network error. Please check your internet connection.", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs sm:text-sm font-semibold text-gray-700">Loading account settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. TOP HERO BANNER */}
        <div className="bg-gradient-to-r from-emerald-950 via-green-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-emerald-800/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Security & Delivery Info
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl">
                Update your contact details and shipping address so physical prizes and instant cash disbursements reach you without delay.
              </p>
            </div>
          </div>
        </div>

        {/* 2. SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-2xs overflow-x-auto no-scrollbar">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors whitespace-nowrap"
          >
            <User className="w-4 h-4 text-gray-500" />
            Dashboard Overview
          </Link>
          <Link
            href="/profile/entries"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors whitespace-nowrap"
          >
            <Gift className="w-4 h-4 text-emerald-600" />
            My Tickets & Entries
          </Link>
          <Link
            href="/profile/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 text-white shadow-2xs whitespace-nowrap"
          >
            <Settings className="w-4 h-4" />
            Account Settings
          </Link>
          <Link
            href="/winners"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors whitespace-nowrap ml-auto"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            Winners Hall of Fame
          </Link>
        </div>

        {/* Feedback Alert Message */}
        {message && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm transition-all ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-300 text-red-900"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* 3. SETTINGS FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal & Shipping Information Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Personal & Delivery Details</h2>
                <p className="text-xs text-gray-500">Used for official winner verification and doorstep TCS dispatch</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
                  Full Name (As on CNIC) *
                </Label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 rounded-xl border-gray-200 text-xs h-11 bg-gray-50/50 focus:bg-white"
                    placeholder="e.g. Muhammad Ali Khan"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 rounded-xl border-gray-200 text-xs h-11 bg-gray-50/50 focus:bg-white"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">
                  Mobile Number (EasyPaisa / JazzCash / WhatsApp)
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 rounded-xl border-gray-200 text-xs h-11 bg-gray-50/50 focus:bg-white font-mono"
                    placeholder="0300 1234567"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Essential for instant prize notifications and cash payouts.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold text-gray-700">
                  City / Residential Town
                </Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="pl-10 rounded-xl border-gray-200 text-xs h-11 bg-gray-50/50 focus:bg-white"
                    placeholder="e.g. Lahore, Islamabad, Karachi, Rawalpindi"
                  />
                </div>
                <p className="text-[10px] text-gray-500">Destination city for courier prize delivery nationwide.</p>
              </div>
            </div>
          </div>

          {/* Security & Password Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-gray-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Account Security & Password</h2>
                <p className="text-xs text-gray-500">Leave blank if you do not wish to change your password</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold text-gray-700">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="pl-10 rounded-xl border-gray-200 text-xs h-11 bg-gray-50/50 focus:bg-white"
                    placeholder="Enter current password to verify"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="pl-10 rounded-xl border-gray-200 text-xs h-11 bg-gray-50/50 focus:bg-white"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 rounded-xl border-gray-200 text-xs h-11 bg-gray-50/50 focus:bg-white"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button & Trust Guarantee */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Your data is encrypted and strictly protected.</span>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
