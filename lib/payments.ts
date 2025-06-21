// Paymob Pakistan Payment Gateway Integration
export class PaymobPayment {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY || ""
    this.baseUrl = "https://pakistan.paymob.com/api"
  }

  // Step 1: Get Authentication Token
  async getAuthToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: this.apiKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Auth token error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      return data.token
    } catch (error) {
      console.error("Get auth token error:", error)
      throw error
    }
  }

  // Step 2: Create Order
  async createOrder(
    authToken: string,
    params: {
      amount: number
      orderId: string
      customerName: string
      customerEmail: string
      customerPhone: string
    },
  ): Promise<any> {
    const { amount, orderId, customerName, customerEmail, customerPhone } = params

    try {
      const response = await fetch(`${this.baseUrl}/ecommerce/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: amount * 100, // Convert to cents
          currency: "PKR",
          merchant_order_id: orderId,
          items: [
            {
              name: "Raffle Entry",
              amount_cents: amount * 100,
              description: "Pakistan Raffle Entry",
              quantity: "1",
            },
          ],
          shipping_data: {
            apartment: "N/A",
            email: customerEmail,
            floor: "N/A",
            first_name: customerName.split(" ")[0] || "Customer",
            street: "N/A",
            building: "N/A",
            phone_number: customerPhone,
            postal_code: "75500",
            extra_description: "N/A",
            city: "Karachi",
            country: "PK",
            last_name: customerName.split(" ")[1] || "User",
            state: "Sindh",
          },
          shipping_details: {
            notes: "Raffle Entry Payment",
            number_of_packages: 1,
            weight: 1,
            weight_unit: "Kilogram",
            length: 1,
            width: 1,
            height: 1,
            contents: "Raffle Entry",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Create order error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Create order error:", error)
      throw error
    }
  }

  // Step 3: Get Payment Key
  async getPaymentKey(
    authToken: string,
    params: {
      orderId: number
      amount: number
      paymentMethod: "CARD" | "EASYPAISA" | "JAZZCASH"
      customerEmail: string
      customerPhone: string
      customerName: string
      returnUrl: string
    },
  ): Promise<string> {
    const { orderId, amount, paymentMethod, customerEmail, customerPhone, customerName, returnUrl } = params

    const integrationId = this.getIntegrationId(paymentMethod)

    try {
      const response = await fetch(`${this.baseUrl}/acceptance/payment_keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amount * 100,
          expiration: 3600, // 1 hour
          order_id: orderId,
          billing_data: {
            apartment: "N/A",
            email: customerEmail,
            floor: "N/A",
            first_name: customerName.split(" ")[0] || "Customer",
            street: "N/A",
            building: "N/A",
            phone_number: customerPhone,
            shipping_method: "N/A",
            postal_code: "75500",
            city: "Karachi",
            country: "PK",
            last_name: customerName.split(" ")[1] || "User",
            state: "Sindh",
          },
          currency: "PKR",
          integration_id: integrationId,
          lock_order_when_paid: "false",
          // Add return URL in payment key request
          redirection_url: returnUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Payment key error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      return data.token
    } catch (error) {
      console.error("Get payment key error:", error)
      throw error
    }
  }

  // Get Integration ID based on payment method
  private getIntegrationId(method: "CARD" | "EASYPAISA" | "JAZZCASH"): number {
    switch (method) {
      case "CARD":
        return Number.parseInt(process.env.PAYMOB_CARD_INTEGRATION_ID || "0")
      case "EASYPAISA":
        return Number.parseInt(process.env.PAYMOB_EASYPAISA_INTEGRATION_ID || "0")
      case "JAZZCASH":
        return Number.parseInt(process.env.PAYMOB_JAZZCASH_INTEGRATION_ID || "0")
      default:
        return Number.parseInt(process.env.PAYMOB_CARD_INTEGRATION_ID || "0")
    }
  }

  // Generate payment URL with return URL parameters
  generatePaymentUrl(
    paymentToken: string,
    paymentMethod: "CARD" | "EASYPAISA" | "JAZZCASH",
    returnUrl: string,
  ): string {
    const iframeId = this.getIframeId(paymentMethod)
    const encodedReturnUrl = encodeURIComponent(returnUrl)

    return `https://pakistan.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}&redirection_url=${encodedReturnUrl}`
  }

  // Get Iframe ID based on payment method
  private getIframeId(method: "CARD" | "EASYPAISA" | "JAZZCASH"): string {
    switch (method) {
      case "CARD":
        return process.env.PAYMOB_CARD_IFRAME_ID || ""
      case "EASYPAISA":
        return process.env.PAYMOB_EASYPAISA_IFRAME_ID || ""
      case "JAZZCASH":
        return process.env.PAYMOB_JAZZCASH_IFRAME_ID || ""
      default:
        return process.env.PAYMOB_CARD_IFRAME_ID || ""
    }
  }

  // Complete payment flow
  async createPayment(params: {
    amount: number
    orderId: string
    customerEmail: string
    customerPhone: string
    customerName: string
    paymentMethod: "CARD" | "EASYPAISA" | "JAZZCASH"
    returnUrl: string
  }) {
    const { amount, orderId, customerEmail, customerPhone, customerName, paymentMethod, returnUrl } = params

    try {
      const authToken = await this.getAuthToken()

      const order = await this.createOrder(authToken, {
        amount,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
      })

      const paymentToken = await this.getPaymentKey(authToken, {
        orderId: order.id,
        amount,
        paymentMethod,
        customerEmail,
        customerPhone,
        customerName,
        returnUrl,
      })

      const paymentUrl = this.generatePaymentUrl(paymentToken, paymentMethod, returnUrl)

      return {
        authToken,
        orderId: order.id,
        paymentToken,
        paymentUrl,
      }
    } catch (error) {
      console.error("Complete payment flow error:", error)
      throw error
    }
  }

  // Process webhook data
  processWebhookData(data: any) {
    
    return {
      transactionId: data.id,
      orderId: data.orderId,
      paymentId:data.paymentId,
      amount: data.amount_cents / 100,
      currency: data.currency,
      status: data.success ? "COMPLETED" : "FAILED",
      paymentMethod: data.source_data?.type || "UNKNOWN",
      customerEmail: data.order?.shipping_data?.email,
      customerPhone: data.order?.shipping_data?.phone_number,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  // Verify transaction callback
  verifyCallback(data: any): boolean {
    // Basic verification - you can add HMAC verification if Paymob provides it
    return data && data.success !== undefined
  }
}
