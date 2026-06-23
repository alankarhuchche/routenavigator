import { Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { DecisionTrace, PaymentIntent } from '../types'

interface Props {
  trace: DecisionTrace
  intent: PaymentIntent
  paymentState?: string
}

export function FinalApprovalCard({ trace, intent, paymentState }: Props) {
  const executionStatus = paymentState ? 'Approved in simulation' : 'Not executed'

  const fields = [
    { label: 'Confirmed intent', value: `${intent.amount} · ${intent.objective.replaceAll('_', ' ').toLowerCase()}` },
    { label: 'Recommended route', value: trace.selectedRoute.label },
    { label: 'Destination', value: intent.destination },
    { label: 'Estimated arrival', value: trace.selectedRoute.eta },
    { label: 'Cost band', value: trace.selectedRoute.cost },
    { label: 'Execution status', value: executionStatus },
  ]

  return (
    <section className="final-approval-card" aria-label="Final approval required">
      <div className="final-approval-head">
        <div className="final-approval-icon" aria-hidden="true">
          <Fingerprint size={22} />
        </div>
        <div>
          <p className="eyebrow">Customer approval boundary</p>
          <h2>Final approval required</h2>
          <p>
            Review the selected route before execution. Your trusted banking agent cannot approve or move money.
          </p>
        </div>
      </div>

      <div className="approval-boundary-copy">
        <ShieldCheck size={16} aria-hidden="true" />
        <div>
          <strong>No money moves until you approve.</strong>
          <span>The agent can explain this route, but only you can approve execution.</span>
        </div>
      </div>

      <dl className="final-approval-grid">
        {fields.map(field => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="approval-method-row">
        <span>
          <LockKeyhole size={14} aria-hidden="true" />
          Approval method: Passkey confirmation mocked for demo
        </span>
        <span>Finality / recall caveat: {trace.finality || 'Finality depends on selected route type'}</span>
      </div>
    </section>
  )
}
