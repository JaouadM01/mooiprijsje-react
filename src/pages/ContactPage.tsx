import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { FaqAccordion } from '@/components/common/FaqAccordion'
import { Icon, type IconName } from '@/components/common/Icon'
import { CONTACT_DETAILS, FAQ_ITEMS, SITE, SOCIAL_LINKS } from '@/config/site'
import { toUserMessage } from '@/data/errors'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useContactMutation } from '@/hooks/useShopData'
import { CONTACT_SUBJECTS, contactSchema, toFieldErrors, type FieldErrors } from '@/lib/validation'
import './pages.css'

interface FormValues {
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
}

const EMPTY_VALUES: FormValues = { name: '', email: '', subject: '', message: '' }
const FIELD_ORDER = ['name', 'email', 'subject', 'message'] as const

const SOCIALS: readonly { readonly key: keyof typeof SOCIAL_LINKS; readonly label: string; readonly icon: IconName }[] = [
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
]

interface FieldProps {
  readonly id: string
  readonly label: string
  readonly error: string | undefined
  readonly children: ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="form__group">
      <label className="form__label" htmlFor={id}>
        {label}
        <span className="form__required" aria-hidden="true">
          {' '}
          *
        </span>
      </label>
      {children}
      {error && (
        <p className="form__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

function ContactForm() {
  const baseId = useId()
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useContactMutation()

  const update =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void =>
      setValues((current) => ({ ...current, [field]: event.target.value }))

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const parsed = contactSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error)
      setErrors(fieldErrors)
      // Zet de focus op het eerste foute veld, zodat toetsenbord- en schermlezergebruikers de fout meteen horen.
      const firstInvalid = FIELD_ORDER.find((field) => fieldErrors[field] !== undefined)
      if (firstInvalid) document.getElementById(`${baseId}-${firstInvalid}`)?.focus()
      return
    }
    setErrors({})
    mutation.mutate(parsed.data, { onSuccess: () => setValues(EMPTY_VALUES) })
  }

  if (mutation.isSuccess) {
    return (
      // Het formulier verdwijnt; verplaats de focus naar de bevestiging zodat die niet verloren gaat.
      <div className="contact__success" role="status" tabIndex={-1} ref={(element) => element?.focus()}>
        <Icon name="check" size={24} />
        <p>Bedankt! Je bericht is verstuurd. We reageren zo snel mogelijk.</p>
      </div>
    )
  }

  const fieldProps = (field: keyof FormValues) => ({
    id: `${baseId}-${field}`,
    'aria-required': true,
    'aria-invalid': errors[field] !== undefined,
    'aria-describedby': errors[field] ? `${baseId}-${field}-error` : undefined,
  })

  return (
    <form onSubmit={submit} noValidate>
      {mutation.isError && (
        <div className="contact__error" role="alert">
          <Icon name="alert" size={20} />
          <p>{toUserMessage(mutation.error)}</p>
        </div>
      )}

      <Field id={`${baseId}-name`} label="Naam" error={errors.name}>
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Jouw naam"
          className="form__input"
          value={values.name}
          onChange={update('name')}
          {...fieldProps('name')}
        />
      </Field>

      <Field id={`${baseId}-email`} label="E-mailadres" error={errors.email}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="jouw@email.nl"
          className="form__input"
          value={values.email}
          onChange={update('email')}
          {...fieldProps('email')}
        />
      </Field>

      <Field id={`${baseId}-subject`} label="Onderwerp" error={errors.subject}>
        <select name="subject" className="form__input" value={values.subject} onChange={update('subject')} {...fieldProps('subject')}>
          <option value="">Selecteer een onderwerp</option>
          {CONTACT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </Field>

      <Field id={`${baseId}-message`} label="Bericht" error={errors.message}>
        <textarea
          name="message"
          rows={6}
          placeholder="Beschrijf je vraag of opmerking..."
          className="form__input form__textarea"
          value={values.message}
          onChange={update('message')}
          {...fieldProps('message')}
        />
      </Field>

      <button type="submit" className="btn-primary btn--full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Versturen…' : 'Bericht versturen'}
      </button>
    </form>
  )
}

export function ContactPage() {
  useDocumentTitle('Contact')
  const socials = SOCIALS.filter((social) => SOCIAL_LINKS[social.key] !== '')

  return (
    <section className="contact-section">
      <div className="contact__grid">
        <div className="contact__info">
          <h1 className="contact__info-title">Neem contact op</h1>
          <p className="contact__info-intro">
            We helpen je graag verder. Stuur ons een bericht en we reageren binnen 1 werkdag.
          </p>
          <ul className="contact__info-list">
            <li className="contact__info-item">
              <Icon name="mail" className="contact__info-icon" />
              <div>
                <span className="contact__info-label">E-mail</span>
                <a href={`mailto:${SITE.email}`} className="contact__info-link">
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="contact__info-item">
              <Icon name="clock" className="contact__info-icon" />
              <div>
                <span className="contact__info-label">Reactietijd</span>
                <span className="contact__info-value">{CONTACT_DETAILS.responseTime}</span>
              </div>
            </li>
            <li className="contact__info-item">
              <Icon name="phone" className="contact__info-icon" />
              <div>
                <span className="contact__info-label">Bereikbaarheid</span>
                <span className="contact__info-value">{CONTACT_DETAILS.hours}</span>
              </div>
            </li>
          </ul>

          {socials.length > 0 && (
            <>
              <hr className="contact__divider" />
              <p className="contact__social-title">Volg ons</p>
              <div className="contact__social-links">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={SOCIAL_LINKS[social.key]}
                    className="contact__social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name={social.icon} />
                    {social.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="contact__form-card">
          <h2 className="contact__form-title">Stuur ons een bericht</h2>
          <ContactForm />
        </div>
      </div>

      <div className="contact__faq">
        <h2 className="contact__faq-title">Veelgestelde vragen</h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </section>
  )
}
