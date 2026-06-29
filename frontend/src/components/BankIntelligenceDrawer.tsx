import {
  BadgeCheck,
  Bot,
  BrainCircuit,
  CheckCircle2,
  FileClock,
  Gauge,
  LockKeyhole,
  MapPinned,
  Mic,
  Route,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ApiPaymentSnapshot, ApiStructuredIntent } from '../apiTypes'
import type { CustomerInsightProfile } from '../data/customerInsights'
import { STATE_LABELS } from '../stateLabels'
import type { DecisionTrace } from '../types'

type Stage = 1 | 2 | 3 | 4 | 5 | 6

interface BankIntelligenceDrawerProps {
  open: boolean
  stage: Stage
  trace: DecisionTrace
  provider?: string
  structuredIntent?: ApiStructuredIntent
  structuredIntentConfirmed: boolean
  structuredIntentFallbackUsed: boolean
  analysisNotice?: string | null
  paymentSnapshot?: ApiPaymentSnapshot | null
  approvalAccepted: boolean
  customerInsightProfile: CustomerInsightProfile
  useCustomerInsights: boolean
  customerInsightsUsedForAnalysis: boolean | null
  onClose: () => void
}

export function BankIntelligenceDrawer({
  open,
  stage,
  trace,
  provider,
  structuredIntent,
  structuredIntentConfirmed,
  structuredIntentFallbackUsed,
  analysisNotice,
  paymentSnapshot,
  approvalAccepted,
  customerInsightProfile,
  useCustomerInsights,
  customerInsightsUsedForAnalysis,
  onClose,
}: BankIntelligenceDrawerProps) {
  if (!open) return null

  return (
    <aside id="bank-intelligence-drawer" className="bank-intelligence-drawer" aria-label="Bank Intelligence drawer">
      <div className="bank-intelligence-panel" role="dialog" aria-modal="false" aria-labelledby="bank-intelligence-title">
        <div className="bank-intelligence-head">
          <div>
            <p className="eyebrow">Bank intelligence</p>
            <h2 id="bank-intelligence-title">{drawerTitle(stage)}</h2>
            <p>{drawerIntro(stage)}</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Close bank intelligence" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="bank-intelligence-body">
          {stage === 1 && <SecureSessionIntel />}
          {stage === 2 && (
            <IntentIntel
              structuredIntent={structuredIntent}
              structuredIntentConfirmed={structuredIntentConfirmed}
              structuredIntentFallbackUsed={structuredIntentFallbackUsed}
            />
          )}
          {stage === 3 && <CustomerInsightIntel profile={customerInsightProfile} useCustomerInsights={useCustomerInsights} />}
          {stage === 4 && (
            <RouteIntel
              trace={trace}
              provider={provider}
              customerInsightProfile={customerInsightProfile}
              customerInsightsUsedForAnalysis={customerInsightsUsedForAnalysis}
            />
          )}
          {stage === 5 && <JourneyIntel trace={trace} analysisNotice={analysisNotice} />}
          {stage === 6 && <ApprovalIntel trace={trace} paymentSnapshot={paymentSnapshot} approvalAccepted={approvalAccepted} />}
        </div>
      </div>
    </aside>
  )
}

function SecureSessionIntel() {
  return (
    <>
      <IntelCard icon={BadgeCheck} title="Session trust">
        <ChipGrid
          items={[
            'Passkey verified',
            'Device/session trust confirmed',
            'Consent scoped to route advice',
            'Execution locked',
          ]}
        />
        <p>Session readiness is mocked for the demo and keeps the customer journey locked until final approval.</p>
      </IntelCard>
      <IntelCard icon={Bot} title="Agent authority">
        <AccessList
          allowed={['Structure intent', 'Request route options', 'Explain recommendation']}
          blocked={['Approve', 'Execute', 'Amend', 'Cancel', 'Move money']}
        />
      </IntelCard>
    </>
  )
}

function IntentIntel({
  structuredIntent,
  structuredIntentConfirmed,
  structuredIntentFallbackUsed,
}: {
  structuredIntent?: ApiStructuredIntent
  structuredIntentConfirmed: boolean
  structuredIntentFallbackUsed: boolean
}) {
  const source = structuredIntent
    ? structuredIntentFallbackUsed
      ? 'Rules/template fallback'
      : sourceLabel(structuredIntent.sourceType)
    : 'Not structured yet'

  return (
    <>
      <IntelCard icon={Mic} title="Transcript handling">
        <ChipGrid items={['Browser SpeechRecognition', 'No raw audio uploaded', 'Customer transcript confirmation']} />
        <p>Speech capture converts browser audio to editable text only. Nothing is sent for structuring until the customer confirms or edits the transcript.</p>
      </IntelCard>
      <IntelCard icon={BrainCircuit} title="Intent structuring">
        <dl className="bank-intelligence-facts">
          <div><dt>Endpoint</dt><dd>/api/intent/classify</dd></div>
          <div><dt>Source</dt><dd>{source}</dd></div>
          <div><dt>Review status</dt><dd>{structuredIntentConfirmed ? 'Customer confirmed for route analysis' : 'Customer review required'}</dd></div>
        </dl>
        <p>Structured intent is a draft. Gemini or rules may structure fields, but cannot choose a route or approve movement.</p>
      </IntelCard>
    </>
  )
}

function CustomerInsightIntel({
  profile,
  useCustomerInsights,
}: {
  profile: CustomerInsightProfile
  useCustomerInsights: boolean
}) {
  return (
    <>
      <IntelCard icon={UserCheck} title="Customer insight source">
        <ChipGrid items={[profile.insightSource, 'Demo/static customer profile', 'No real customer data used']} />
        <dl className="bank-intelligence-facts">
          <div><dt>Purpose signal</dt><dd>{profile.purposeDetected}</dd></div>
          <div><dt>Pattern signal</dt><dd>{profile.usualMovementPattern}</dd></div>
          <div><dt>Beneficiary signal</dt><dd>{profile.beneficiaryRelationship}</dd></div>
          <div><dt>Consent state</dt><dd>{useCustomerInsights ? 'Enabled for this analysis' : 'Switched off for this analysis'}</dd></div>
        </dl>
      </IntelCard>
      <IntelCard icon={ShieldCheck} title="Insight boundary">
        <ChipGrid items={['No external services called', 'No profile-aware scoring yet', 'Hard controls still override']} />
        <p>Customer insight can influence ranking only in a future phase and cannot override fraud, sanctions, limits, eligibility or regulatory controls.</p>
      </IntelCard>
    </>
  )
}

function RouteIntel({
  trace,
  provider,
  customerInsightProfile,
  customerInsightsUsedForAnalysis,
}: {
  trace: DecisionTrace
  provider?: string
  customerInsightProfile: CustomerInsightProfile
  customerInsightsUsedForAnalysis: boolean | null
}) {
  const selectedScore = trace.selectedRoute.score
  const rejected = trace.candidates.filter(candidate => candidate.status === 'EXCLUDED')
  const passedGates = trace.gates.filter(gate => gate.result === 'PASS').length
  const blockedGates = trace.gates.length - passedGates

  return (
    <>
      <IntelCard icon={Route} title="Recommendation authority">
        <ChipGrid items={['Route engine owns recommendation', explanationProvider(provider), 'AI cannot choose or approve']} />
        <p>The deterministic route engine applies gates, controls and scoring. Gemini/template explanation only turns the redacted trace into plain language.</p>
      </IntelCard>
      <IntelCard icon={BrainCircuit} title="Customer insight pass-through">
        <dl className="bank-intelligence-facts">
          <div><dt>Insight used</dt><dd>{customerInsightsUsedForAnalysis ? 'Yes, as context only' : 'No'}</dd></div>
          <div><dt>Purpose</dt><dd>{customerInsightProfile.purposeDetected}</dd></div>
          <div><dt>Pattern</dt><dd>{customerInsightProfile.usualMovementPattern}</dd></div>
          <div><dt>Scoring change</dt><dd>None in Phase 4C</dd></div>
        </dl>
        <p>Route scoring has not changed in this phase. Customer insight is passed through as visible context only.</p>
      </IntelCard>
      <IntelCard icon={Gauge} title="Route evidence">
        <dl className="bank-intelligence-facts">
          <div><dt>Candidates</dt><dd>{trace.candidates.length}</dd></div>
          <div><dt>Selected score</dt><dd>{selectedScore !== undefined ? selectedScore.toFixed(1) : 'Not scored'}</dd></div>
          <div><dt>Controls</dt><dd>{passedGates} passed, {blockedGates} blocked</dd></div>
          <div><dt>Rejected alternatives</dt><dd>{rejected.length}</dd></div>
        </dl>
      </IntelCard>
      <IntelCard icon={XCircle} title="Not selected">
        <ul className="bank-intelligence-list">
          {(rejected.length ? rejected : trace.candidates.filter(candidate => candidate.status !== 'SELECTED').slice(0, 2)).map(candidate => (
            <li key={candidate.id}>
              <strong>{candidate.label}</strong>
              <span>{candidate.reasons[0] ?? 'Did not best match confirmed intent and controls.'}</span>
            </li>
          ))}
        </ul>
      </IntelCard>
    </>
  )
}

function JourneyIntel({ trace, analysisNotice }: { trace: DecisionTrace; analysisNotice?: string | null }) {
  return (
    <>
      <IntelCard icon={MapPinned} title="Map evidence">
        <ChipGrid items={['Representative journey', 'Not live telemetry', 'No real correspondent data']} />
        <p>The journey map is expected/representative only. It is derived from selected route type and decision trace, not live scheme or correspondent bank telemetry.</p>
      </IntelCard>
      <IntelCard icon={ShieldCheck} title="Controls and finality">
        <dl className="bank-intelligence-facts">
          <div><dt>Point of no return</dt><dd>{trace.pointOfNoReturn}</dd></div>
          <div><dt>Finality</dt><dd>{trace.finality}</dd></div>
          <div><dt>Fallback</dt><dd>{trace.fallback}</dd></div>
        </dl>
        <p>Finality and recall boundaries depend on the selected route type. No money has moved before customer approval.</p>
      </IntelCard>
      {analysisNotice && (
        <IntelCard icon={FileClock} title="Demo caveat">
          <p>{analysisNotice}</p>
        </IntelCard>
      )}
    </>
  )
}

function ApprovalIntel({
  trace,
  paymentSnapshot,
  approvalAccepted,
}: {
  trace: DecisionTrace
  paymentSnapshot?: ApiPaymentSnapshot | null
  approvalAccepted: boolean
}) {
  const state = paymentSnapshot?.state ? STATE_LABELS[paymentSnapshot.state] ?? paymentSnapshot.state : approvalAccepted ? 'Static demo approval acknowledged' : 'Awaiting customer approval'
  return (
    <>
      <IntelCard icon={LockKeyhole} title="Approval boundary">
        <ChipGrid items={['Customer/passkey approval required', 'Agent cannot approve', 'Voice cannot approve', 'Gemini cannot approve']} />
        <p>Approval is the customer-controlled boundary. No agent, voice transcript, Gemini response or route explanation can execute movement.</p>
      </IntelCard>
      <IntelCard icon={FileClock} title="Simulation state">
        <dl className="bank-intelligence-facts">
          <div><dt>Current state</dt><dd>{state}</dd></div>
          <div><dt>Events shown</dt><dd>{paymentSnapshot?.events.length ?? trace.events.length}</dd></div>
          <div><dt>Execution mode</dt><dd>Simulation only</dd></div>
        </dl>
        <p>This demo does not connect to real rails, bank accounts, wallets, FX, sanctions systems or customer data.</p>
      </IntelCard>
    </>
  )
}

function IntelCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="bank-intelligence-card">
      <div className="bank-intelligence-card-title">
        <Icon size={17} aria-hidden="true" />
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  )
}

function ChipGrid({ items }: { items: string[] }) {
  return (
    <div className="bank-intelligence-chips">
      {items.map(item => (
        <span key={item}>
          <CheckCircle2 size={13} aria-hidden="true" />
          {item}
        </span>
      ))}
    </div>
  )
}

function AccessList({ allowed, blocked }: { allowed: string[]; blocked: string[] }) {
  return (
    <div className="bank-intelligence-access">
      <div>
        <strong>Allowed</strong>
        <ul>{allowed.map(item => <li key={item}>{item}</li>)}</ul>
      </div>
      <div>
        <strong>Blocked</strong>
        <ul>{blocked.map(item => <li key={item}>{item}</li>)}</ul>
      </div>
    </div>
  )
}

function drawerTitle(stage: Stage) {
  switch (stage) {
    case 1:
      return 'Secure session controls'
    case 2:
      return 'Intent structuring context'
    case 3:
      return 'Customer insight evidence'
    case 4:
      return 'Route recommendation evidence'
    case 5:
      return 'Journey and controls evidence'
    case 6:
      return 'Approval and tracking evidence'
  }
}

function drawerIntro(stage: Stage) {
  switch (stage) {
    case 1:
      return 'Behind-the-scenes controls for trust, consent and agent authority.'
    case 2:
      return 'How transcript text becomes a draft structured intent before customer review.'
    case 3:
      return 'What consented customer context may be considered before route analysis.'
    case 4:
      return 'How the deterministic route engine produced the recommendation.'
    case 5:
      return 'How the representative journey, controls and finality boundary should be interpreted.'
    case 6:
      return 'How approval, simulation state and audit boundaries are protected.'
  }
}

function sourceLabel(sourceType: string) {
  if (sourceType === 'gemini') return 'Gemini structured draft'
  if (sourceType === 'rules') return 'Rules fallback structured draft'
  if (sourceType === 'template') return 'Template structured draft'
  return sourceType
}

function explanationProvider(provider?: string) {
  if (provider === 'GEMINI') return 'Gemini explains only'
  if (provider) return 'Template/fallback explains only'
  return 'Demo explanation only'
}
