import { z } from 'zod'

export const CONTACT_SUBJECTS = ['Bestelling', 'Retour', 'Product', 'Overig'] as const

const emailField = z.string().trim().pipe(z.email('Vul een geldig e-mailadres in.'))

export const newsletterSchema = z.object({ email: emailField })

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Vul je naam in.').max(100, 'Je naam is te lang.'),
  email: emailField,
  subject: z.enum(CONTACT_SUBJECTS, { error: 'Selecteer een onderwerp.' }),
  message: z
    .string()
    .trim()
    .min(10, 'Schrijf minimaal 10 tekens.')
    .max(2000, 'Je bericht is te lang (maximaal 2000 tekens).'),
})

export type ContactInput = z.infer<typeof contactSchema>
export type FieldErrors = Readonly<Record<string, string>>

/** Eerste foutmelding per veld. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form')
    if (!(field in errors)) errors[field] = issue.message
  }
  return errors
}
