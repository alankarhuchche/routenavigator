import { GitBranch, ShieldCheck } from 'lucide-react'
import type { DecisionTrace } from '../types'

const FALLBACK_STATE_LABELS: Record<string, string> = {
  FALLBACK_SELECTED: 'Fallback route selected automatically',
  FALLBACK_FAILED: 'Fallback unavailable',
  INVESTIGATION_REQUIRED: 'Under investigation',
}

export function FallbackEventView({ trace }: { trace: DecisionTrace }) {
  if (!trace.fallbackEvent) {
    return null
  }

  const event = trace.fallbackEvent

  return (
    <section className="panel fallback-panel">
      <div className="panel-title">
        <GitBranch size={18} aria-hidden="true" />
        <h2>Resilience: Automatic Fallback</h2>
      </div>
      <div className="fallback-body">
        <div className="fallback-status">
          <ShieldCheck size={18} aria-hidden="true" />
          <strong>{FALLBACK_STATE_LABELS[event.state] ?? event.state}</strong>
          <span>
            {event.pointOfNoReturnReached
              ? 'After point of no return'
              : 'Before point of no return — funds never at risk'}
          </span>
        </div>
        <p>{event.message}</p>
        <dl className="fallback-grid">
          <div>
            <dt>What failed</dt>
            <dd>{event.trigger}</dd>
          </div>
          <div>
            <dt>Recovered onto</dt>
            <dd>{event.activeRouteLabel}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
