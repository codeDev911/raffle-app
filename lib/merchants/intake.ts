// The store-intake questions asked at the end of the welcome wizard.
//
// One list feeds both sides: the wizard renders it, the API validates against it. That keeps the
// labels a merchant reads and the values we store from ever drifting apart.

export type IntakeKey = "source" | "storeName" | "dailyOrders" | "teamSize" | "averageOrderValue" | "storeAge"

/** Picked when none of the canned answers fit; the merchant then types their own. */
export const INTAKE_OTHER = "other"

export interface IntakeQuestion {
  key: IntakeKey
  /** Rendered as "Q1", "Q2"… in the wizard. */
  number: number
  label: string
  /** Empty for the one free-text question (the shop name). */
  options: Array<{ value: string; label: string }>
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    key: "source",
    number: 1,
    label: "How did you find us?",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "facebook", label: "Facebook" },
      { value: "tiktok", label: "TikTok" },
      { value: "youtube", label: "YouTube" },
      { value: "google", label: "Google search" },
      { value: "friend", label: "Friend or another merchant" },
      { value: "customer", label: "I'm a PakRaffle customer" },
      { value: "whatsapp", label: "WhatsApp group" },
      { value: INTAKE_OTHER, label: "Other" },
    ],
  },
  {
    key: "storeName",
    number: 2,
    label: "Your shop / store name",
    options: [],
  },
  {
    key: "dailyOrders",
    number: 3,
    label: "How many orders do you process daily?",
    options: [
      { value: "lt5", label: "Fewer than 5" },
      { value: "5to10", label: "5 – 10" },
      { value: "11to25", label: "11 – 25" },
      { value: "26to50", label: "26 – 50" },
      { value: "51to100", label: "51 – 100" },
      { value: "gt100", label: "More than 100" },
      { value: INTAKE_OTHER, label: "Other" },
    ],
  },
  {
    key: "teamSize",
    number: 4,
    label: "How many are you in the team?",
    options: [
      { value: "solo", label: "Just me" },
      { value: "2to3", label: "2 – 3 people" },
      { value: "4to10", label: "4 – 10 people" },
      { value: "11to25", label: "11 – 25 people" },
      { value: "gt25", label: "More than 25" },
      { value: INTAKE_OTHER, label: "Other" },
    ],
  },
  {
    key: "averageOrderValue",
    number: 5,
    label: "What is the average order price?",
    options: [
      { value: "lt1000", label: "Under Rs. 1,000" },
      { value: "1000to2500", label: "Rs. 1,000 – 2,500" },
      { value: "2500to5000", label: "Rs. 2,500 – 5,000" },
      { value: "5000to10000", label: "Rs. 5,000 – 10,000" },
      { value: "10000to25000", label: "Rs. 10,000 – 25,000" },
      { value: "gt25000", label: "Above Rs. 25,000" },
      { value: INTAKE_OTHER, label: "Other" },
    ],
  },
  {
    key: "storeAge",
    number: 6,
    label: "How old is your store?",
    options: [
      { value: "prelaunch", label: "Not launched yet" },
      { value: "lt3m", label: "Less than 3 months" },
      { value: "3to12m", label: "3 – 12 months" },
      { value: "1to2y", label: "1 – 2 years" },
      { value: "2to5y", label: "2 – 5 years" },
      { value: "gt5y", label: "More than 5 years" },
      { value: INTAKE_OTHER, label: "Other" },
    ],
  },
]

/**
 * Stored in `MerchantStore.intakeAnswers`. Each question holds the chosen option value, and
 * `<key>Other` holds the typed answer when the merchant picked "Other".
 */
export type IntakeAnswers = Partial<Record<IntakeKey | `${IntakeKey}Other`, string>>

export function isIntakeKey(key: string): key is IntakeKey {
  return INTAKE_QUESTIONS.some((question) => question.key === key)
}

/** The answer a human would read: the typed text when "Other" was picked, else the option label. */
export function describeIntakeAnswer(key: IntakeKey, answers: IntakeAnswers | null | undefined): string {
  const question = INTAKE_QUESTIONS.find((item) => item.key === key)
  const value = answers?.[key]
  if (!question || !value) return "—"
  if (value === INTAKE_OTHER) return answers?.[`${key}Other`] || "Other"
  return question.options.find((option) => option.value === value)?.label || value
}
