import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { DecisionTrace } from '../types'

interface ApprovalTransitionPanelProps {
  trace: DecisionTrace
  mode: 'handoff' | 'tracking'
}

export function ApprovalTransitionPanel({ trace, mode }: ApprovalTransitionPanelProps) {
  const isTracking = mode === 'tracking'

  return (
    <section className={`approval-transition-panel ${isTracking ? 'tracking-mode' : 'handoff-mode'}`} aria-label={isTracking ? 'Approval accepted' : 'Approval handoff'}>
      <div className="approval-transition-main">
        <div className="approval-transition-icon" aria-hidden="true">
          {isTracking ? <ShieldCheck size={21} /> : <LockKeyhole size={21} />}
        </div>
        <div>
          <p className="eyebrow">{isTracking ? 'Approval & Tracking' : 'Customer handoff'}</p>
          <h2>{isTracking ? 'Approval accepted in simulation' : 'Route recommendation ready for approval'}</h2>
          <p>
            {isTracking
              ? 'The customer approval boundary has been crossed in this demo. Track the simulated journey below.'
              : 'The route engine has recommended a route. Final customer approval is still required before simulated execution.'}
          </p>
        </div>
      </div>

      <div className="approval-transition-steps" aria-label="Approval boundary sequence">
        <span>Intent confirmed</span>
        <ArrowRight size={14} aria-hidden="true" />
        <span>Route engine recommended</span>
        <ArrowRight size={14} aria-hidden="true" />
        <strong>{isTracking ? 'Tracking after approval' : 'Awaiting customer approval'}</strong>
      </div>

      <p className="approval-transition-boundary">
        Agent boundary: the trusted banking agent may explain this route, but cannot approve, execute, amend, cancel or move money.
      </p>
      <p className="approval-transition-route">Recommended route: {trace.selectedRoute.label}</p>
    </section>
  )
}
