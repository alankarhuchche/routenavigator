import { BadgeCheck, BrainCircuit, CircleDot, Gauge, GitBranch, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import type { DecisionTrace } from '../types'

export function ControlRoom({ trace }: { trace: DecisionTrace }) {
  const passedGates = trace.gates.filter((gate) => gate.result === 'PASS').length
  const blockedGates = trace.gates.length - passedGates
  const activeRoute = trace.fallbackEvent?.activeRouteLabel ?? trace.selectedRoute.label
  const currentState = trace.fallbackEvent?.state ?? 'AWAITING_AUTHORISATION'
  const score = trace.selectedRoute.score ?? Math.max(...Object.values(trace.scoreDimensions))

  return (
    <section className="panel control-room">
      <div className="panel-title">
        <Gauge size={18} aria-hidden="true" />
        <h2>Control Room</h2>
      </div>
      <div className="control-grid">
        <ControlMetric icon={<CircleDot size={16} aria-hidden="true" />} label="State" value={currentState} tone="blue" />
        <ControlMetric icon={<BadgeCheck size={16} aria-hidden="true" />} label="Selected" value={trace.selectedRoute.label} tone="green" />
        <ControlMetric icon={<GitBranch size={16} aria-hidden="true" />} label="Active" value={activeRoute} tone="teal" />
        <ControlMetric
          icon={<ShieldAlert size={16} aria-hidden="true" />}
          label="PONR"
          value={trace.fallbackEvent?.pointOfNoReturnReached ? 'Reached' : 'Not reached'}
          tone={trace.fallbackEvent?.pointOfNoReturnReached ? 'amber' : 'green'}
        />
      </div>

      <div className="control-detail-grid">
        <div>
          <dt>Fallback</dt>
          <dd>{trace.fallbackEvent ? trace.fallbackEvent.message : trace.fallback}</dd>
        </div>
        <div>
          <dt>Gate summary</dt>
          <dd>{passedGates} pass / {blockedGates} excluded</dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{score.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Trace</dt>
          <dd>{trace.traceId}</dd>
        </div>
      </div>

      <div className="control-boundary">
        <BrainCircuit size={16} aria-hidden="true" />
        <span>{trace.aiBoundary}</span>
      </div>

      <ol className="control-events">
        {trace.events.slice(-4).map((event) => (
          <li key={event}>{event}</li>
        ))}
      </ol>
    </section>
  )
}

function ControlMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: 'amber' | 'blue' | 'green' | 'teal'
}) {
  return (
    <div className={`control-metric tone-${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
