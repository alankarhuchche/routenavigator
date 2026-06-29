import { ReceiptText } from 'lucide-react'
import type { PaymentIntent } from '../types'

export function PaymentIntentView({ intent }: { intent: PaymentIntent }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <ReceiptText size={18} aria-hidden="true" />
        <h2>Money Movement Intent</h2>
      </div>
      <dl className="intent-grid">
        <div>
          <dt>Amount</dt>
          <dd>{intent.amount}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{intent.source}</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>{intent.destination}</dd>
        </div>
        <div>
          <dt>Objective</dt>
          <dd>{intent.objective}</dd>
        </div>
        <div>
          <dt>Tracking</dt>
          <dd>{intent.trackingRequired ? 'Required' : 'Optional'}</dd>
        </div>
        <div>
          <dt>Digital options</dt>
          <dd>{intent.digitalRoutesAllowed ? 'Allowed' : 'Not allowed'}</dd>
        </div>
      </dl>
      <div className="constraint-list">
        {intent.constraints.map((constraint) => (
          <span key={constraint}>{displayConstraint(constraint)}</span>
        ))}
      </div>
    </section>
  )
}

function displayConstraint(constraint: string) {
  return constraint
    .replaceAll('Digital routes', 'Digital options')
    .replaceAll('digital routes', 'digital options')
}
