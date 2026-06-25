import { BadgeCheck, Bot, CheckCircle2 } from 'lucide-react'
import type { ApiStructuredIntent } from '../apiTypes'
import type { PaymentIntent } from '../types'

interface IntentConfirmationCardProps {
  intent: PaymentIntent
  structuredIntent?: ApiStructuredIntent
  fallbackUsed?: boolean
  warnings?: string[]
  confirmed?: boolean
  onConfirm?: () => void
}

export function IntentConfirmationCard({
  intent,
  structuredIntent,
  fallbackUsed,
  warnings,
  confirmed,
  onConfirm,
}: IntentConfirmationCardProps) {
  const fields = [
    { label: 'Amount', value: display(structuredIntent?.amount ?? intent.amount) },
    { label: 'Destination', value: display(structuredIntent?.destinationCountry ?? intent.destination) },
    { label: 'Beneficiary type', value: display(structuredIntent?.beneficiaryType ?? beneficiaryType(intent.destination)) },
    { label: 'Target currency', value: display(structuredIntent?.currency ?? targetCurrency(intent.amount, intent.destination)) },
    { label: 'Urgency', value: urgency(structuredIntent?.objective ?? intent.objective) },
    { label: 'Priority', value: objectiveLabel(structuredIntent?.objective ?? intent.objective) },
    { label: 'Payment purpose', value: structuredIntent?.purpose ?? intent.constraints[0] ?? 'To be confirmed' },
    { label: 'Execution permission', value: 'Not granted — final approval required' },
  ]
  const sourceLabel = structuredIntent
    ? fallbackUsed
      ? 'Demo fallback structured this intent. Review before route analysis.'
      : 'AI structured this intent. Review before route analysis.'
    : 'Confirm this structured payment intent before we analyse safe routes.'

  return (
    <section className="intent-confirmation-card" aria-label="Structured payment intent confirmation">
      <div className="intent-confirmation-head">
        <div>
          <h3>Here’s what I understood</h3>
          <p>{sourceLabel}</p>
        </div>
        <span>
          <CheckCircle2 size={15} aria-hidden="true" />
          {confirmed ? 'Confirmed for route analysis' : 'Customer review required'}
        </span>
      </div>

      <dl className="intent-confirmation-grid">
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="intent-confirmation-meta">
        <span>
          <Bot size={14} aria-hidden="true" />
          Source: {structuredIntent ? sourceName(structuredIntent.sourceType) : 'Demo preview'}
        </span>
        <span>
          <BadgeCheck size={14} aria-hidden="true" />
          Intent confidence: {structuredIntent ? `${Math.round(structuredIntent.confidence * 100)}% demo estimate` : 'Demo estimate'}
        </span>
      </div>

      {warnings && warnings.length > 0 && (
        <ul className="intent-warning-list">
          {warnings.map((warning) => <li key={warning}>{warning}</li>)}
        </ul>
      )}

      <p className="intent-confirmation-boundary">
        No payment can move from this step. This confirmed intent is used by the route engine. The agent cannot change it or execute the payment.
      </p>

      {onConfirm && (
        <button type="button" className="secondary-btn intent-confirm-button" onClick={onConfirm}>
          {confirmed ? 'Structured intent confirmed' : 'Confirm structured intent'}
        </button>
      )}
    </section>
  )
}

function display(value: string | undefined) {
  return value && value.trim() ? value : 'To be confirmed'
}

function beneficiaryType(destination: string) {
  const normalised = destination.toLowerCase()
  if (normalised.includes('wallet')) return 'Digital wallet'
  if (normalised.includes('bank')) return 'Bank account'
  return 'To be confirmed'
}

function targetCurrency(amount: string, destination: string) {
  const combined = `${amount} ${destination}`.toUpperCase()
  const currencies = ['GBP', 'USD', 'USDC', 'INR', 'CNY', 'EUR', 'AUD', 'AED']
  return currencies.find((currency) => combined.includes(currency)) ?? 'To be confirmed'
}

function urgency(objective: string) {
  if (objective === 'FASTEST') return 'Fastest available compliant route'
  if (objective === 'CHEAPEST') return 'Speed secondary'
  if (objective === 'MOST_TRANSPARENT') return 'Traceability preferred'
  return 'To be confirmed'
}

function objectiveLabel(objective: string) {
  return objective.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())
}

function sourceName(sourceType: string) {
  if (sourceType === 'gemini') return 'Gemini structured draft'
  if (sourceType === 'rules') return 'Rules fallback structured draft'
  if (sourceType === 'template') return 'Template structured draft'
  return sourceType
}
