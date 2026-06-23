import { BadgeCheck, Bot, CheckCircle2 } from 'lucide-react'
import type { PaymentIntent } from '../types'

interface IntentConfirmationCardProps {
  intent: PaymentIntent
}

export function IntentConfirmationCard({ intent }: IntentConfirmationCardProps) {
  const fields = [
    { label: 'Amount', value: display(intent.amount) },
    { label: 'Destination', value: display(intent.destination) },
    { label: 'Beneficiary type', value: beneficiaryType(intent.destination) },
    { label: 'Target currency', value: targetCurrency(intent.amount, intent.destination) },
    { label: 'Urgency', value: urgency(intent.objective) },
    { label: 'Priority', value: objectiveLabel(intent.objective) },
    { label: 'Payment purpose', value: intent.constraints[0] ?? 'To be confirmed' },
    { label: 'Execution permission', value: 'Not granted — final approval required' },
  ]

  return (
    <section className="intent-confirmation-card" aria-label="Structured payment intent confirmation">
      <div className="intent-confirmation-head">
        <div>
          <h3>Here’s what I understood</h3>
          <p>Confirm this structured payment intent before we analyse safe routes.</p>
        </div>
        <span>
          <CheckCircle2 size={15} aria-hidden="true" />
          Ready for route analysis
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
          Captured by: Trusted banking agent
        </span>
        <span>
          <BadgeCheck size={14} aria-hidden="true" />
          Intent confidence: Demo estimate
        </span>
      </div>

      <p className="intent-confirmation-boundary">
        This confirmed intent is used by the route engine. The agent cannot change it or execute the payment.
      </p>
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
