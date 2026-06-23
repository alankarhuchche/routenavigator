import { Award, CheckCircle2, Clock3, FileText, LockKeyhole, Route, ShieldCheck } from 'lucide-react'
import type { DecisionTrace, RouteCandidate } from '../types'

interface Props {
  trace: DecisionTrace
}

export function RecommendationHeroCard({ trace }: Props) {
  const selected = trace.selectedRoute
  const recommendationReason =
    selected.reasons[0] ??
    'This route was recommended because it best matches the confirmed payment intent, available route controls and current scoring policy.'

  const badges = buildBadges(trace)

  return (
    <section className="recommendation-hero" aria-label="Recommended route">
      <div className="recommendation-main">
        <div className="recommendation-icon" aria-hidden="true">
          <Award size={22} />
        </div>
        <div>
          <p className="eyebrow">Bank recommendation</p>
          <h2>Recommended: {recommendationOutcome(trace)}</h2>
          <p className="recommendation-subtitle">Uses {readableRouteName(selected)}.</p>
        </div>
      </div>

      <p className="recommendation-reason">{recommendationReason}</p>

      <div className="recommendation-badges" aria-label="Recommendation evidence">
        {badges.map((badge) => {
          const Icon = badge.icon
          return (
            <span key={badge.label}>
              <Icon size={14} aria-hidden="true" />
              {badge.label}
            </span>
          )
        })}
      </div>

      <div className="recommendation-footer">
        <p>
          <strong>Trade-off:</strong> {tradeOffCopy(selected)}
        </p>
        <p className="recommendation-boundary">
          Recommended by the route engine. Explained by GenAI.
        </p>
      </div>
    </section>
  )
}

function recommendationOutcome(trace: DecisionTrace): string {
  const selected = trace.selectedRoute
  const finality = (trace.finality ?? '').toLowerCase()
  const label = (selected.label ?? '').toLowerCase()

  if (finality.includes('inr') || label.includes('india')) {
    return 'Best chance of compliant INR receipt'
  }
  if (finality.includes('beneficiary usable value') || finality.includes('beneficiary bank')) {
    return 'Best route to beneficiary usable value'
  }
  if (selected.family.includes('DOMESTIC')) {
    return 'Fast domestic payment outcome'
  }
  if (selected.family.includes('WALLET')) {
    return 'Wallet-ready digital value transfer'
  }
  if (selected.family.includes('STABLECOIN')) {
    return 'Fast digital-dollar payout route'
  }
  return 'Best match for the confirmed payment intent'
}

function readableRouteName(route: RouteCandidate): string {
  return route.label || humaniseIdentifier(route.family)
}

function humaniseIdentifier(value: string): string {
  return value
    .toLowerCase()
    .split(/[_-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function tradeOffCopy(route: RouteCandidate): string {
  if (route.cost && route.cost.toLowerCase() !== 'low') {
    return 'This may not be the cheapest route, but it provides stronger alignment with the requested outcome.'
  }
  return 'Detailed alternatives and rejected routes are shown below.'
}

function buildBadges(trace: DecisionTrace) {
  const selected = trace.selectedRoute
  const excludedRoutes = trace.candidates.filter(route => route.status === 'EXCLUDED').length
  const badges = [
    { label: 'Available route', icon: CheckCircle2 },
    { label: 'Controls passed', icon: ShieldCheck },
    { label: `Estimated arrival: ${selected.eta}`, icon: Clock3 },
    { label: `Cost: ${selected.cost}`, icon: Route },
    { label: 'Final approval required', icon: LockKeyhole },
  ]

  if (trace.finality) {
    badges.push({ label: 'Finality assessed', icon: FileText })
  } else if (excludedRoutes > 0) {
    badges.push({ label: 'Alternatives recorded', icon: FileText })
  }

  return badges.slice(0, 6)
}
