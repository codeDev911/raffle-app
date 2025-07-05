import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import  paymentsController from "@/app/controllers/payments.controller"
  
 
export async function POST(request: NextRequest) {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const body = await request.json();
    

    // const randomMethod = Math.random() < 0.5 ? "paymob" : "safepay";
    return await paymentsController["ewallets"](body,user)

}
  