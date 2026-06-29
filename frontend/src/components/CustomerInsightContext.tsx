import { BrainCircuit, CheckCircle2, History, ShieldCheck, SlidersHorizontal, UserCheck } from 'lucide-react'
import type { CustomerInsightProfile } from '../data/customerInsights'

interface CustomerInsightContextProps {
  profile: CustomerInsightProfile
  useInsights: boolean
  isAnalysing: boolean
  onUseInsightsChange: (enabled: boolean) => void
  onAnalyse: (useInsights: boolean) => void
}

const signalIcons = {
  purpose: BrainCircuit,
  pattern: SlidersHorizontal,
  beneficiary: UserCheck,
  preference: CheckCircle2,
  history: History,
  risk: ShieldCheck,
  consent: UserCheck,
}

export function CustomerInsightContext({
  profile,
  useInsights,
  isAnalysing,
  onUseInsightsChange,
  onAnalyse,
}: CustomerInsightContextProps) {
  return (
    <section className="customer-insight-context" aria-label="Customer Insight Context">
      <div className="customer-insight-hero">
        <div>
          <p className="eyebrow">Customer Insight Context</p>
          <h2>Review customer context before route analysis</h2>
          <p>
            The bank may consider consented customer insight alongside the confirmed money movement intent,
            controls and route conditions.
          </p>
        </div>
        <span>
          <ShieldCheck size={15} aria-hidden="true" />
          {profile.insightSource}
        </span>
      </div>

      <div className="customer-insight-grid">
        {profile.insights.map((insight) => {
          const Icon = signalIcons[insight.signal]
          return (
            <article className="customer-insight-card" key={insight.id}>
              <div>
                <Icon size={17} aria-hidden="true" />
                <h3>{insight.label}</h3>
              </div>
              <strong>{insight.value}</strong>
              <p>{insight.summary}</p>
              <span>{insight.use}</span>
            </article>
          )
        })}
      </div>

      <div className="customer-insight-boundary">
        <ShieldCheck size={17} aria-hidden="true" />
        <p>
          Customer insight can influence route ranking in a future phase, but it cannot override fraud,
          sanctions, limits, eligibility or regulatory controls. In this phase, it is visible context only.
        </p>
      </div>

      <div className="customer-insight-choice">
        <label className="customer-insight-toggle">
          <input
            type="checkbox"
            aria-label="Use customer insight for this analysis"
            checked={useInsights}
            onChange={(event) => onUseInsightsChange(event.target.checked)}
          />
          <span>
            <strong>Use customer insight for this analysis</strong>
            <small>Defaulted from mocked consent. You can switch it off for this demo run.</small>
          </span>
        </label>
        <div className="customer-insight-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={() => onAnalyse(true)}
            disabled={isAnalysing}
          >
            {isAnalysing ? 'Analysing...' : 'Use insights and analyse safe routes'}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => onAnalyse(false)}
            disabled={isAnalysing}
          >
            Analyse without customer insight
          </button>
        </div>
      </div>

      <p className="customer-insight-footnote">
        Mocked demo data only. No real customer accounts, transactions, external services or profile systems are connected.
      </p>
    </section>
  )
}
