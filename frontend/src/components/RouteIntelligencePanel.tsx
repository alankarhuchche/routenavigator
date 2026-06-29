import {
  CheckCircle2,
  Clock3,
  Gauge,
  Info,
  Landmark,
  ListChecks,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import type { CustomerInsightProfile } from '../data/customerInsights'
import type { DecisionTrace } from '../types'

interface Props {
  trace: DecisionTrace
  customerInsightsUsed?: boolean | null
  insightProfile?: CustomerInsightProfile
}

const lanes = [
  {
    title: 'Movement option availability',
    icon: Landmark,
    lines: [
      'Domestic, international and digital options checked',
      'Available safe routes identified',
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
      'Digital options require wallet/off-ramp eligibility',
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
      'Executable movement options ranked',
      'Rejected routes recorded with reason codes',
    ],
  },
]

export function RouteIntelligencePanel({ trace, customerInsightsUsed, insightProfile }: Props) {
  const candidateRoutes = trace.candidates.length
  const executableRoutes = trace.candidates.filter(
    route => route.status === 'SELECTED' || route.status === 'AVAILABLE',
  ).length
  const rejectedRoutes = trace.candidates.filter(route => route.status === 'EXCLUDED').length
  const metricSource = candidateRoutes > 0 ? 'Derived from current route decision' : 'Demo analysis'

  const metrics = [
    { label: 'Candidate options', value: candidateRoutes > 0 ? String(candidateRoutes) : 'Demo' },
    { label: 'Executable options', value: candidateRoutes > 0 ? String(executableRoutes) : 'Demo' },
    { label: 'Rejected options', value: candidateRoutes > 0 ? String(rejectedRoutes) : 'Demo' },
    { label: 'Recommended safe route', value: trace.selectedRoute.label || 'To be confirmed' },
  ]

  return (
    <section className="route-intelligence-panel" aria-label="Route intelligence analysis">
      <div className="route-intelligence-head">
        <div>
          <p className="eyebrow">Route intelligence</p>
          <h2>Analysing the best safe way</h2>
          <p>
            Checking availability, cut-offs, controls and settlement quality before recommending how to move the money.
          </p>
        </div>
        <span className="route-intelligence-source">
          <Gauge size={15} aria-hidden="true" />
          {metricSource}
        </span>
      </div>

      <div className={`route-insight-context ${customerInsightsUsed ? 'used' : 'not-used'}`}>
        <Info size={16} aria-hidden="true" />
        <div>
          <strong>
            {customerInsightsUsed ? 'Customer insight considered' : 'Customer insight not used for this analysis'}
          </strong>
          <p>
            {customerInsightsUsed
              ? `This recommendation considered the confirmed money movement intent and relevant customer context, including ${insightProfile?.purposeDetected ?? 'declared purpose'} and ${insightProfile?.riskNormality ?? 'normality context'}.`
              : 'This recommendation used the confirmed money movement intent and route controls only.'}
          </p>
          {customerInsightsUsed && (
            <small>Customer insight is shown as context in this phase. Profile-aware scoring is planned for a later phase.</small>
          )}
        </div>
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
