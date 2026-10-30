"use client"

import type React from "react"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Alert, Btn, Field, SelectInput, TextInput } from "@/components/merchants/ui"
import { INTAKE_OTHER, INTAKE_QUESTIONS, type IntakeAnswers } from "@/lib/merchants/intake"

/**
 * The store intake: six questions, five of them dropdowns whose last option is "Other".
 * Picking "Other" reveals a free-text box for that question only.
 */
export function IntakeForm({
  initial,
  defaultStoreName,
  busy = false,
  error,
  onSubmit,
  onSkip,
}: {
  initial?: IntakeAnswers | null
  /** Prefills Q2 when the store already exists. */
  defaultStoreName?: string
  busy?: boolean
  error?: string | null
  onSubmit: (answers: IntakeAnswers) => void
  onSkip?: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const start: Record<string, string> = {}
    for (const question of INTAKE_QUESTIONS) {
      const value = initial?.[question.key]
      if (value) start[question.key] = value
      const other = initial?.[`${question.key}Other`]
      if (other) start[`${question.key}Other`] = other
    }
    if (!start.storeName && defaultStoreName) start.storeName = defaultStoreName
    return start
  })

  const set = (key: string, value: string) => setAnswers((current) => ({ ...current, [key]: value }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const payload: IntakeAnswers = {}
    for (const question of INTAKE_QUESTIONS) {
      const value = (answers[question.key] || "").trim()
      if (!value) continue
      payload[question.key] = value
      if (value === INTAKE_OTHER) {
        const other = (answers[`${question.key}Other`] || "").trim()
        if (other) payload[`${question.key}Other`] = other
      }
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert>{error}</Alert>}

      {INTAKE_QUESTIONS.map((question) => {
        const label = `Q${question.number} · ${question.label}`
        // The shop name is typed; everything else is picked from a list.
        if (!question.options.length) {
          return (
            <Field key={question.key} label={label}>
              <TextInput
                required
                maxLength={160}
                value={answers[question.key] || ""}
                onChange={(event) => set(question.key, event.target.value)}
                placeholder="Zubair Apparel"
              />
            </Field>
          )
        }
        const pickedOther = answers[question.key] === INTAKE_OTHER
        return (
          <div key={question.key} className="space-y-2">
            <Field label={label}>
              <SelectInput
                required
                value={answers[question.key] || ""}
                onChange={(event) => set(question.key, event.target.value)}
              >
                <option value="" disabled>
                  Select an answer
                </option>
                {question.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
            {pickedOther && (
              <TextInput
                required
                autoFocus
                maxLength={160}
                value={answers[`${question.key}Other`] || ""}
                onChange={(event) => set(`${question.key}Other`, event.target.value)}
                placeholder="Tell us in your own words"
                aria-label={`Q${question.number} · your answer`}
              />
            )}
          </div>
        )
      })}

      <div className="flex flex-wrap gap-2 pt-1">
        <Btn type="submit" loading={busy}>
          Submit &amp; continue <ArrowRight className="h-4 w-4" />
        </Btn>
        {onSkip && (
          <Btn type="button" variant="ghost" onClick={onSkip} disabled={busy}>
            Skip for now
          </Btn>
        )}
      </div>
    </form>
  )
}
