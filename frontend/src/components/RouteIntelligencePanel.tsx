import {
  CheckCircle2,
  Clock3,
  Gauge,
  Landmark,
  ListChecks,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import type { DecisionTrace } from '../types'

interface Props {
  trace: DecisionTrace
}

const lanes = [
  {
    title: 'Rail availability',
    icon: Landmark,
    lines: [
      'Domestic, international and digital rails checked',
      'Available routes identified',
    ],
  },
  {
    title: 'Scheme windows and cut-offs',
    icon: Clock3,
    lines: [
      'Scheme operating windows checked',
      'Currency and FX cut-offs assessed',
    ],
  },
  {
    title: 'Controls and eligibility',
    icon: ShieldCheck,
    lines: [
      'Beneficiary, fraud, sanctions and policy gates evaluated',
      'Digital routes require wallet/off-ramp eligibility',
    ],
  },
  {
    title: 'Settlement quality',
    icon: Scale,
    lines: [
      'Finality, reversibility and atomicity assessed',
      'Technical settlement and customer outcome separated',
    ],
  },
  {
    title: 'Recommendation readiness',
    icon: ListChecks,
    lines: [
      'Executable routes ranked',
      'Rejected routes recorded with reason codes',
    ],
  },
]

export function RouteIntelligencePanel({ trace }: Props) {
  const candidateRoutes = trace.candidates.length
  const executableRoutes = trace.candidates.filter(
    route => route.status === 'SELECTED' || route.status === 'AVAILABLE',
  ).length
  const rejectedRoutes = trace.candidates.filter(route => route.status === 'EXCLUDED').length
  const metricSource = candidateRoutes > 0 ? 'Derived from current route decision' : 'Demo analysis'

  const metrics = [
    { label: 'Candidate routes', value: candidateRoutes > 0 ? String(candidateRoutes) : 'Demo' },
    { label: 'Executable routes', value: candidateRoutes > 0 ? String(executableRoutes) : 'Demo' },
    { label: 'Rejected routes', value: candidateRoutes > 0 ? String(rejectedRoutes) : 'Demo' },
    { label: 'Recommended route', value: trace.selectedRoute.label || 'To be confirmed' },
  ]

  return (
    <section className="route-intelligence-panel" aria-label="Route intelligence analysis">
      <div className="route-intelligence-head">
        <div>
          <p className="eyebrow">Route intelligence</p>
          <h2>Analysing safe routes</h2>
          <p>
            Checking route availability, cut-offs, controls and settlement quality before recommending a route.
          </p>
        </div>
        <span className="route-intelligence-source">
          <Gauge size={15} aria-hidden="true" />
          {metricSource}
        </span>
      </div>

      <div className="route-intelligence-lanes">
        {lanes.map((lane) => {
          const Icon = lane.icon
          return (
            <article className="route-intelligence-lane" key={lane.title}>
              <div className="route-intelligence-lane-icon">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <h3>{lane.title}</h3>
                <ul>
                  {lane.lines.map(line => (
                    <li key={line}>
                      <CheckCircle2 size={14} aria-hidden="true" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>

      <div className="route-intelligence-summary">
        <dl className="route-intelligence-metrics">
          {metrics.map(metric => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
        <p className="route-intelligence-boundary">
          The route engine applies policy, controls and scoring. GenAI only explains the result.
        </p>
      </div>
    </section>
  )
}
