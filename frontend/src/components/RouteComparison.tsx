import { Route } from 'lucide-react'
import type { DecisionTrace } from '../types'

export function RouteComparison({ trace }: { trace: DecisionTrace }) {
  return (
    <section className="panel route-comparison">
      <div className="panel-title">
        <Route size={18} aria-hidden="true" />
        <h2>Route Comparison</h2>
      </div>
      <div className="route-table">
        <div className="route-row route-head">
          <span>Route</span>
          <span>Status</span>
          <span>ETA</span>
          <span>Cost</span>
          <span title="Composite score 0–100 based on speed, cost, certainty and transparency for your objective">Score</span>
        </div>
        {trace.candidates.map((candidate) => (
          <div className={`route-row status-${candidate.status.toLowerCase()}`} key={candidate.id}>
            <span>
              <strong>{candidate.label}</strong>
            </span>
            <span>{candidate.status}</span>
            <span>{candidate.eta}</span>
            <span>{candidate.cost}</span>
            <span>{candidate.score?.toFixed(1) ?? '-'}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
