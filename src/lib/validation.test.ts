import { contactSchema, newsletterSchema, toFieldErrors } from './validation'

const validContact = {
  name: 'Lisa de Vries',
  email: 'lisa@voorbeeld.nl',
  subject: 'Retour',
  message: 'Mijn scherm past niet, hoe retourneer ik het?',
}

describe('newsletterSchema', () => {
  it('trims and accepts a valid email', () => {
    expect(newsletterSchema.parse({ email: '  jij@voorbeeld.nl ' }).email).toBe('jij@voorbeeld.nl')
  })

  it('rejects invalid and empty emails with a Dutch message', () => {
    const result = newsletterSchema.safeParse({ email: 'geen-email' })
    expect(result.success).toBe(false)
    if (!result.success) expect(toFieldErrors(result.error).email).toBe('Vul een geldig e-mailadres in.')
    expect(newsletterSchema.safeParse({ email: '' }).success).toBe(false)
  })
})

describe('contactSchema', () => {
  it('accepts a valid message', () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true)
  })

  it('reports one message per invalid field', () => {
    const result = contactSchema.safeParse({ name: '', email: 'x', subject: '', message: 'kort' })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(toFieldErrors(result.error)).toEqual({
      name: 'Vul je naam in.',
      email: 'Vul een geldig e-mailadres in.',
      subject: 'Selecteer een onderwerp.',
      message: 'Schrijf minimaal 10 tekens.',
    })
  })

  it('rejects unknown subjects', () => {
    expect(contactSchema.safeParse({ ...validContact, subject: 'Spam' }).success).toBe(false)
  })

  it('rejects overly long messages', () => {
    expect(contactSchema.safeParse({ ...validContact, message: 'x'.repeat(2001) }).success).toBe(false)
  })
})
