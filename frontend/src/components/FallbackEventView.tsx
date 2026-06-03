import { GitBranch, ShieldCheck } from 'lucide-react'
import type { DecisionTrace } from '../types'

export function FallbackEventView({ trace }: { trace: DecisionTrace }) {
  if (!trace.fallbackEvent) {
    return null
  }

  const event = trace.fallbackEvent

  return (
    <section className="panel fallback-panel">
      <div className="panel-title">
        <GitBranch size={18} aria-hidden="true" />
        <h2>Fallback Event</h2>
      </div>
      <div className="fallback-body">
        <div className="fallback-status">
          <ShieldCheck size={18} aria-hidden="true" />
          <strong>{event.state}</strong>
          <span>{event.pointOfNoReturnReached ? 'After PONR' : 'Before PONR'}</span>
        </div>
        <p>{event.message}</p>
        <dl className="fallback-grid">
          <div>
            <dt>Trigger</dt>
            <dd>{event.trigger}</dd>
          </div>
          <div>
            <dt>Updated route</dt>
            <dd>{event.activeRouteLabel}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
