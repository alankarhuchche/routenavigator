import { Activity, Check } from 'lucide-react'
import type { DecisionTrace } from '../types'

export function PaymentTracker({ trace }: { trace: DecisionTrace }) {
  const lastIndex = trace.events.length - 1
  return (
    <section className="panel payment-tracker">
      <div className="panel-title">
        <Activity size={18} aria-hidden="true" />
        <h2>Payment Tracker</h2>
      </div>
      <ol className="tracker-list">
        {trace.events.map((event, index) => {
          const isCurrent = index === lastIndex
          return (
            <li key={event} className={isCurrent ? 'tracker-current' : 'tracker-done'}>
              <span aria-hidden="true">
                {isCurrent ? index + 1 : <Check size={12} strokeWidth={3} />}
              </span>
              <strong>{event}</strong>
              {isCurrent && <em className="tracker-now">Now</em>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
