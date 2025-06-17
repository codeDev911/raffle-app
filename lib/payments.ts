import crypto from "crypto"

// EasyPaisa Integration
export class EasyPaisaPayment {
  private merchantId: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.merchantId = process.env.EASYPAISA_MERCHANT_ID || ""
    this.secretKey = process.env.EASYPAISA_SECRET_KEY || ""
    this.baseUrl = process.env.EASYPAISA_BASE_URL || "https://easypaisa.com.pk/easypay"
  }

  generateHash(data: string): string {
    return crypto.createHmac("sha256", this.secretKey).update(data).digest("hex")
  }

  async initiatePayment(params: {
    amount: number
    orderId: string
    customerEmail: string
    customerPhone: string
    returnUrl: string
  }) {
    const { amount, orderId, customerEmail, customerPhone, returnUrl } = params

    const paymentData = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: this.merchantId,
      pp_SubMerchantID: "",
      pp_Password: this.secretKey,
      pp_BankID: "TBANK",
      pp_ProductID: "RETL",
      pp_TxnRefNo: orderId,
      pp_Amount: (amount * 100).toString(), // Convert to paisa
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: new Date().toISOString().replace(/[-:]/g, "").split(".")[0],
      pp_BillReference: orderId,
      pp_Description: "PakRaffle Entry Payment",
      pp_TxnExpiryDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace(/[-:]/g, "").split(".")[0],
      pp_ReturnURL: returnUrl,
      pp_SecureHash: "",
      ppmpf_1: customerEmail,
      ppmpf_2: customerPhone,
    }

    // Generate secure hash
    const hashString = Object.values(paymentData).slice(0, -1).join("&")
    paymentData.pp_SecureHash = this.generateHash(hashString)

    return {
      url: `${this.baseUrl}/Index.jsf`,
      data: paymentData,
    }
  }

  async verifyPayment(responseData: any): Promise<boolean> {
    const { pp_SecureHash, ...otherData } = responseData
    const hashString = Object.values(otherData).join("&")
    const calculatedHash = this.generateHash(hashString)

    return calculatedHash === pp_SecureHash && responseData.pp_ResponseCode === "000"
  }
}

// JazzCash Integration
export class JazzCashPayment {
  private merchantId: string
  private password: string
  private integritySalt: string
  private baseUrl: string

  constructor() {
    this.merchantId = process.env.JAZZCASH_MERCHANT_ID || ""
    this.password = process.env.JAZZCASH_PASSWORD || ""
    this.integritySalt = process.env.JAZZCASH_INTEGRITY_SALT || ""
    this.baseUrl = process.env.JAZZCASH_BASE_URL || "https://sandbox.jazzcash.com.pk"
  }

  generateHash(data: string): string {
    return crypto.createHmac("sha256", this.integritySalt).update(data).digest("hex")
  }

  async initiatePayment(params: {
    amount: number
    orderId: string
    customerEmail: string
    customerPhone: string
    returnUrl: string
  }) {
    const { amount, orderId, customerEmail, customerPhone, returnUrl } = params

    const paymentData = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: this.merchantId,
      pp_SubMerchantID: "",
      pp_Password: this.password,
      pp_BankID: "TBANK",
      pp_ProductID: "RETL",
      pp_TxnRefNo: orderId,
      pp_Amount: (amount * 100).toString(), // Convert to paisa
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: new Date().toISOString().replace(/[-:]/g, "").split(".")[0],
      pp_BillReference: orderId,
      pp_Description: "PakRaffle Entry Payment",
      pp_TxnExpiryDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace(/[-:]/g, "").split(".")[0],
      pp_ReturnURL: returnUrl,
      pp_SecureHash: "",
      ppmpf_1: customerEmail,
      ppmpf_2: customerPhone,
    }

    // Generate secure hash
    const hashString = Object.values(paymentData).slice(0, -1).join("&")
    paymentData.pp_SecureHash = this.generateHash(hashString)

    return {
      url: `${this.baseUrl}/ApplicationAPI/API/Payment/DoTransaction`,
      data: paymentData,
    }
  }

  async verifyPayment(responseData: any): Promise<boolean> {
    const { pp_SecureHash, ...otherData } = responseData
    const hashString = Object.values(otherData).join("&")
    const calculatedHash = this.generateHash(hashString)

    return calculatedHash === pp_SecureHash && responseData.pp_ResponseCode === "000"
  }
}
