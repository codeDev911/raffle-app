"use client"

import { EnterRaffleModal } from '@/components/enter-raffle-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, CheckCircle, CheckCircleIcon, Clock10Icon, Star, Trophy, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
interface Raffle {
  id: string
  title: string
  description: string
  longDescription?: string
  image?: string
  gallery: string[]
  price: number
  realPrice:number
  totalEntries: number
  currentEntries: number
  category: string
  entries:any[]
  featured: boolean
  endDate: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  specifications: string[]
  rules: string[]
  winners?: any[]
}

const ClientSide = ({raffle}:{raffle:Raffle}) => {
  const searchParams = useSearchParams()
  const openEnModal = searchParams.get("openEnModal") || 0
  const referralLinkId = searchParams.get("lnk") || false
 
  const [user, setUser] = useState<any>(null)
  const [isUserPurchased,setIsUserPurchased] = useState(false)
  const [showModal, setShowModal] = useState(openEnModal === "1")
  const [paymentUnderReview,setPaymentUnderReview] = useState()


  const getMe =async()=>{
     // Check if user is authenticated
        const userResponse = await fetch("/api/auth/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
                     
          const py = userData.payments.length>0 && userData.payments.filter((payment:any) => payment.metadata["raffleId"] == raffle.id)[0]
          
          setPaymentUnderReview(py)
          
          
          raffle.entries.filter((entry:any)=> entry.userId == userData.id).length > 0 ? setIsUserPurchased(true): setIsUserPurchased(false)
         
        } 
  }

  useEffect(()=>{
    if(referralLinkId){ 
       let client_browse_id = localStorage.getItem("client_browse_id")
        fetch(`${process.env.NEXT_PUBLIC_PARTNER_APP_URL}/api/partner/links/click-event`, {
        method:"POST",
        headers:{
          "Content-Type": "application/json",
          "api-key": process.env.NEXT_PUBLIC_API_KEY_TO_PARTNER || ""
        },
        body:JSON.stringify({referralLinkId,client_browse_id})
      }).then(res=>res).then(data=>data).catch(err=>console.log(err))

    }
       getMe()
  })

 
  const handleEnterRaffle = () => {
    if (!user) {
      location.assign(`/auth/login?comback=/raffles/${raffle.id}&openEnModal=1&lnk=${referralLinkId}`)
      return
    }
    setShowModal(true)
  }

  const getStatusInfo = () => {
    if (!raffle) return { color: "gray", text: "Unknown", icon: XCircle }

    switch (raffle.status) {
      case "ACTIVE":
        if (raffle.currentEntries >= raffle.totalEntries) {
          return { color: "orange", text: "Sold Out", icon: XCircle }
        }
        const timeLeft = new Date(raffle.endDate).getTime() - new Date().getTime()
        if (timeLeft <= 0) {
          return { color: "red", text: "Ended", icon: XCircle }
        }
        return { color: "green", text: "Active", icon: CheckCircle }
      case "COMPLETED":
        return { color: "blue", text: "Completed", icon: Trophy }
      case "CANCELLED":
        return { color: "red", text: "Cancelled", icon: XCircle }
      default:
        return { color: "gray", text: "Unknown", icon: XCircle }
    }
  }

  const canEnterRaffle = () => {
    if (!raffle) return false
    if (raffle.status !== "ACTIVE") return false
    if (raffle.currentEntries >= raffle.totalEntries) return false
    const timeLeft = new Date(raffle.endDate).getTime() - new Date().getTime()
    return timeLeft > 0
  }

  const  getActionButton = () => {
    if (!raffle) return null

    const statusInfo = getStatusInfo()
    const StatusIcon = statusInfo.icon

    if (canEnterRaffle()) {
      return (

        <>
        {
          paymentUnderReview  ?
         <div className="w-full flex justify-center space-y-2 items-center flex-col">
           <Button disabled variant={"default"}>
            <Clock10Icon className="w-5"/>
              Your payment under review
          </Button>
          <p className="text-c  ext-gray-500 text-sm">Your payment to this reffle is under processing. Once approved your entry will fulfill</p>
         </div>
            :
          <Button
            onClick={handleEnterRaffle}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl py-6 text-lg font-medium"
            >
            Buy entry {formatCurrency(raffle.price)}
          </Button>
          }
          </>
      )
    }

    return (
      <Button disabled className={`w-full rounded-2xl py-6 text-lg font-medium bg-${statusInfo.color}-500`} variant="outline">
        <StatusIcon className="mr-2 h-5 w-5" />
        {statusInfo.text}
      </Button>
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

  const timeLeft = new Date(raffle.endDate).getTime() - new Date().getTime()
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

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
              <Badge
                className={`absolute bottom-4 left-4 rounded-2xl ${
                  statusInfo.color === "green"
                    ? "bg-green-500 text-white"
                    : statusInfo.color === "blue"
                      ? "bg-blue-500 text-white"
                      : statusInfo.color === "orange"
                        ? "bg-orange-500 text-white"
                        : statusInfo.color == "red"
                          ? "bg-red-500 text-white"
                          : "bg-gray-500 text-white"
                }`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.text}
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

              <div className="flex-col space-y-1">
                <p className="text-base text-gray-500">
                Orignal price
              </p>
              <div className="text-4xl font-bold text-gray-500 line-through">
                 {formatCurrency(raffle.realPrice)}
              </div>
              </div>
              <div className="flex-col  space-y-1">
                <p className="text-base text-gray-500">
                Per entry
              </p>
                <div className="text-3xl font-bold text-green-500">
                  {formatCurrency(raffle.price)} 
                </div>
                {/* <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
                </div> */}
              </div>
               <div className="flex">
                 <div className="space-x-2 px-4 pr-5 text-base items-center text-gray-800 p-3 rounded-xl bg-green-100 flex font-semibold">
                  <Trophy className="w-5 h-5"/>
                  <p>Participated : {(raffle.currentEntries+3) * 3 } </p>

                </div>  
               </div>
            </div>

           
              {/* If user hasn't purchased  */}
              {isUserPurchased && raffle.status=="ACTIVE"  ? 
                <div className="flex-col space-y-2  text-center">
                  <Button asChild variant="secondary" className="w-full rounded-2xl py-6 text-lg font-medium">
                    <div >
                      <CheckCircleIcon className="mr-2 h-5 w-5" />
                      {"You're participated"}
                    </div>
                </Button>
                <p className="text-gray-500 text-sm">{`You are participated in this raffle.`} <Link href={"#"} className="text-green-500 font-semibold underline ">View reciept</Link></p>
                </div>
              :
              <div className="space-y-4">
                {getActionButton()}
              </div>
              }
                {raffle.status === "COMPLETED" && raffle?.winners && raffle.winners.length > 0 && (
              <Button asChild variant="outline" className="w-full rounded-2xl py-6 text-lg font-medium">
                <Link href={`/raffles/${raffle.id}/winner`}>
                  <Trophy className="mr-2 h-5 w-5" />
                  View Winner
                </Link>
              </Button>
            )}

           
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

      {/* Enter Raffle Modal */}
      {raffle && <EnterRaffleModal raffle={raffle} referralLinkId={referralLinkId} isOpen={showModal} onClose={() => setShowModal(false)} />}
    </div>
   
  )
}


export default ClientSide