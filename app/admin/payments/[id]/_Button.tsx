"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"

interface buttonProps {
  paymentId : string | null
  quantity: Number | null
  raffleId: string |null
  status : string |null
}

const _Button = ({paymentId,quantity,raffleId,status}:buttonProps) => {
  const [isLoading,setIsLoading] = useState(false)
    const verifyPayment = async()=>{
      setIsLoading(true)
      try {
        let res = fetch("/api/payments/callback",{
          method:"PUT",
          body:JSON.stringify({
            paymentId,
            status:"COMPLETED",
            quantity,
            raffleId
        })
        })
        if((await res).status == 200){
          alert("Verified success")
        }
        
      } catch (error) {
        console.log(error);
        
        alert("Error occured see console")
      }
      finally{
          setIsLoading(false)

      }
    }
  
  return (
        <Button onClick={verifyPayment} className="bg-green-500 hover:bg-green-400 active:bg-green-600">
          {isLoading ? "Verifying..." :"Verify Payment"}
        </Button>

  )
}

export default _Button