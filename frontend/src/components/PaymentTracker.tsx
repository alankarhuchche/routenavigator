import { Activity } from 'lucide-react'
import type { DecisionTrace } from '../types'

export function PaymentTracker({ trace }: { trace: DecisionTrace }) {
  return (
    <section className="panel payment-tracker">
      <div className="panel-title">
        <Activity size={18} aria-hidden="true" />
        <h2>Payment Tracker</h2>
      </div>
      <ol className="tracker-list">
        {trace.events.map((event, index) => (
          <li key={event}>
            <span>{index + 1}</span>
            <strong>{event}</strong>
          </li>
        ))}
      </ol>
    </section>
  )
}
