import { useCallback, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { demoScenarios } from './data/demoData'
import { demoCustomerInsightProfile } from './data/customerInsights'
import { ControlRoom } from './components/ControlRoom'
import { ApprovalTransitionPanel } from './components/ApprovalTransitionPanel'
import { CustomerInsightContext } from './components/CustomerInsightContext'
import { DisclaimerBanner } from './components/DisclaimerBanner'
import { DecisionImpactBanner } from './components/DecisionImpactBanner'
import { DecisionTracePanel } from './components/DecisionTracePanel'
import { FallbackEventView } from './components/FallbackEventView'
import { FinalApprovalCard } from './components/FinalApprovalCard'
import { LeafletRouteMap } from './components/LeafletRouteMap'
import { PaymentIntentIntake } from './components/PaymentIntentIntake'
import { DEFAULT_PAYMENT_INTENT_TEXT } from './defaultIntent'
import { PaymentIntentView } from './components/PaymentIntentView'
import { PaymentTracker } from './components/PaymentTracker'
import { RecommendationHeroCard } from './components/RecommendationHeroCard'
import { RouteComparison } from './components/RouteComparison'
import { RouteIntelligencePanel } from './components/RouteIntelligencePanel'
import { ScenarioSelector } from './components/ScenarioSelector'
import { StepIndicator } from './components/StepIndicator'
import { BankIntelligenceDrawer } from './components/BankIntelligenceDrawer'
import { TrustedAgentExplanationPanel } from './components/TrustedAgentExplanationPanel'
import { ArrowRight, BadgeCheck, Bot, CheckCircle2, Fingerprint, LockKeyhole, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import type { DecisionTrace, PaymentIntent } from './types'
import type { ApiIntentClassificationResponse, ApiPaymentSnapshot, ApiStructuredIntent } from './apiTypes'
import { createRouteDecision, fetchExplanation, authorisePayment, simulateNext, simulateDegradation, classifyIntent } from './api'
import { adaptTrace } from './traceAdapter'
import type { LivePreferences } from './components/PaymentIntentIntake'
import { STATE_LABELS } from './stateLabels'

type JourneyStep = 1 | 2 | 3 | 4 | 5 | 6

const secureReadinessItems = [
  { label: 'Passkey verified', detail: 'Device-bound authentication confirmed', icon: BadgeCheck },
  { label: 'Device trust confirmed', detail: 'Session bound to this browser demo', icon: Fingerprint },
  { label: 'Trusted banking agent active', detail: 'Advice-only mode', icon: Bot },
  { label: 'Consent scoped', detail: 'Route advice only', icon: ShieldCheck },
  { label: 'Execution locked', detail: 'Final approval required', icon: LockKeyhole },
]

function App() {
  const [scenarioId, setScenarioId] = useState(demoScenarios[0].id)
  const [step, setStep] = useState<JourneyStep>(1)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const [liveTraceId, setLiveTraceId] = useState<string | null>(null)
  const [liveTrace, setLiveTrace] = useState<DecisionTrace | null>(null)
  const [explanationProvider, setExplanationProvider] = useState<string | undefined>(undefined)
  const [intentText, setIntentText] = useState(DEFAULT_PAYMENT_INTENT_TEXT)
  const [livePreferences, setLivePreferences] = useState<LivePreferences | null>(null)
  const [classifyReason, setClassifyReason] = useState<string | null>(null)
  const [structuredIntent, setStructuredIntent] = useState<ApiStructuredIntent | undefined>(undefined)
  const [structuredIntentFallbackUsed, setStructuredIntentFallbackUsed] = useState(false)
  const [structuredIntentWarnings, setStructuredIntentWarnings] = useState<string[]>([])
  const [structuredIntentConfirmed, setStructuredIntentConfirmed] = useState(false)
  const [isStructuringIntent, setIsStructuringIntent] = useState(false)
  const [structureError, setStructureError] = useState<string | null>(null)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [analyseError, setAnalyseError] = useState<string | null>(null)
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null)
  const [paymentSnapshot, setPaymentSnapshot] = useState<ApiPaymentSnapshot | null>(null)
  const [staticApprovalAcknowledged, setStaticApprovalAcknowledged] = useState(false)
  const [isAuthorising, setIsAuthorising] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isBankIntelligenceOpen, setIsBankIntelligenceOpen] = useState(false)
  const [useCustomerInsights, setUseCustomerInsights] = useState(demoCustomerInsightProfile.consentForPersonalisedRouting)
  const [customerInsightsUsedForAnalysis, setCustomerInsightsUsedForAnalysis] = useState<boolean | null>(null)

  const scenario = useMemo(
    () => demoScenarios.find((candidate) => candidate.id === scenarioId) ?? demoScenarios[0],
    [scenarioId],
  )

  const baseTrace = liveTrace ?? scenario.trace
  const displayTrace = useMemo(() => {
    if (!paymentSnapshot || !liveTrace) {
      return baseTrace
    }
    return {
      ...liveTrace,
      events: paymentSnapshot.events.length > 0
        ? paymentSnapshot.events.map(e => e.message)
        : liveTrace.events,
    }
  }, [baseTrace, liveTrace, paymentSnapshot])

  const displayIntent = useMemo(() => {
    const base = scenario.intent
    if (structuredIntent) {
      return {
        ...base,
        amount: structuredIntent.amount || base.amount,
        source: structuredIntent.source || base.source,
        destination: structuredIntent.destinationCountry || base.destination,
        objective: structuredIntent.objective || base.objective,
        trackingRequired: structuredIntent.trackingRequired,
        digitalRoutesAllowed: structuredIntent.digitalRoutesAllowed,
        constraints: structuredIntent.purpose && structuredIntent.purpose !== 'To be confirmed'
          ? [structuredIntent.purpose]
          : base.constraints,
      }
    }
    if (!livePreferences) return base
    return {
      ...base,
      objective: livePreferences.objective,
      trackingRequired: livePreferences.trackingRequired,
      digitalRoutesAllowed: livePreferences.digitalRoutesAllowed,
    }
  }, [scenario.intent, livePreferences, structuredIntent])

  const maxUnlockedStep: JourneyStep = analysisComplete ? 6 : structuredIntentConfirmed ? 3 : 2
  const approvalAccepted = Boolean(paymentSnapshot) || staticApprovalAcknowledged

  function handleStepClick(s: number) {
    if ((s === 1 || s === 2 || s === 3 || s === 4 || s === 5 || s === 6) && s <= maxUnlockedStep) {
      setIsBankIntelligenceOpen(false)
      setStep(s as JourneyStep)
    }
  }

  function handleReset() {
    setIsBankIntelligenceOpen(false)
    setStep(1)
    setAnalysisComplete(false)
    setLiveTrace(null)
    setLiveTraceId(null)
    setPaymentSnapshot(null)
    setStaticApprovalAcknowledged(false)
    setClassifyReason(null)
    setAnalyseError(null)
    setAnalysisNotice(null)
    setExplanationProvider(undefined)
    setStructuredIntent(undefined)
    setStructuredIntentFallbackUsed(false)
    setStructuredIntentWarnings([])
    setStructuredIntentConfirmed(false)
    setStructureError(null)
    setUseCustomerInsights(demoCustomerInsightProfile.consentForPersonalisedRouting)
    setCustomerInsightsUsedForAnalysis(null)
  }

  const handleIntentTextChange = useCallback((text: string) => {
    setIntentText(text)
    setStructuredIntentConfirmed(false)
  }, [])

  async function handleStructureIntent(textOverride?: string) {
    const textForStructuring = textOverride?.trim() || intentText.trim()
    if (!textForStructuring) {
      setStructureError('Enter or speak a money movement outcome before structuring the intent.')
      return
    }
    if (textOverride?.trim()) {
      setIntentText(textOverride.trim())
    }
    setIsStructuringIntent(true)
    setStructureError(null)
    setStructuredIntentConfirmed(false)
    try {
      const classified: ApiIntentClassificationResponse = await classifyIntent(textForStructuring)
      setClassifyReason(classified.reason)
      const classifiedScenario = demoScenarios.find((candidate) => candidate.id === classified.scenarioId)
      if (scenario.executionMode !== 'STATIC_DEMO' && classifiedScenario?.executionMode !== 'STATIC_DEMO') {
        setScenarioId(classified.scenarioId)
      }
      setStructuredIntent(classified.structuredIntent ?? localStructuredIntent(textForStructuring, displayIntent))
      setStructuredIntentFallbackUsed(Boolean(classified.fallbackUsed || classified.classifiedBy !== 'GEMINI' || !classified.structuredIntent))
      setStructuredIntentWarnings(classified.warnings ?? [])
    } catch {
      setStructuredIntent(localStructuredIntent(textForStructuring, displayIntent))
      setStructuredIntentFallbackUsed(true)
      setStructuredIntentWarnings(['Demo fallback structured this intent locally for customer review. No payment can move from this step.'])
      setClassifyReason('Backend intent structuring unavailable — using local demo fallback structured intent.')
    } finally {
      setIsStructuringIntent(false)
    }
  }

  async function handleAnalyse(useInsights: boolean = useCustomerInsights) {
    if (!intentText.trim()) {
      setAnalyseError('Enter a money movement outcome before analysing safe routes.')
      return
    }
    if (!structuredIntentConfirmed) {
      setAnalyseError('Confirm the structured intent before analysing safe routes.')
      return
    }
    setIsAnalysing(true)
    setAnalyseError(null)
    setAnalysisNotice(null)
    setClassifyReason(null)
    setPaymentSnapshot(null)
    setStaticApprovalAcknowledged(false)
    setCustomerInsightsUsedForAnalysis(useInsights)
    try {
      // Use the client-side matched scenario as authoritative source.
      // The backend classifier only supplies the reason text — it predates
      // the full corridor set and would override correct client matches.
      const resolvedScenarioId = scenarioId
      if (scenario.executionMode === 'STATIC_DEMO') {
        setLiveTrace(null)
        setLiveTraceId(null)
        setExplanationProvider(undefined)
        setAnalysisNotice(`${scenario.executionLabel ?? 'Illustrative corridor demo'} — using static frontend route trace. Backend corridor support is deferred.`)
        setAnalysisComplete(true)
        setIsBankIntelligenceOpen(false)
        setStep(4)
        return
      }
      // Step 2: run route decision + Gemini explanation
      const apiTrace = await createRouteDecision(resolvedScenarioId, useInsights ? {
        customerInsightUsed: true,
        customerInsightContext: {
          purposeDetected: demoCustomerInsightProfile.purposeDetected,
          usualMovementPattern: demoCustomerInsightProfile.usualMovementPattern,
          typicalAmountRange: demoCustomerInsightProfile.typicalAmountRange,
          beneficiaryRelationship: demoCustomerInsightProfile.beneficiaryRelationship,
          trackingPreference: demoCustomerInsightProfile.trackingPreference,
          speedPreference: demoCustomerInsightProfile.speedPreference,
          feeSensitivity: demoCustomerInsightProfile.feeSensitivity,
          previousRouteExperience: demoCustomerInsightProfile.previousRouteExperience,
          riskNormality: demoCustomerInsightProfile.riskNormality,
          digitalRoutesAllowed: demoCustomerInsightProfile.digitalRoutesAllowed,
          consentForPersonalisedRouting: demoCustomerInsightProfile.consentForPersonalisedRouting,
          insightSource: demoCustomerInsightProfile.insightSource,
        },
      } : { customerInsightUsed: false })
      const explanationResp = await fetchExplanation(apiTrace.traceId)
      const matchedScenario = demoScenarios.find(s => s.id === resolvedScenarioId) ?? scenario
      const adapted = adaptTrace(apiTrace, matchedScenario, explanationResp.explanation)
      setLiveTraceId(apiTrace.traceId)
      setLiveTrace(adapted)
      setExplanationProvider(explanationResp.provider)
      setAnalysisComplete(true)
      setIsBankIntelligenceOpen(false)
      setStep(4)
    } catch {
      setAnalyseError('Analysis failed — using demo data')
      setAnalysisComplete(true)
      setIsBankIntelligenceOpen(false)
      setStep(4)
    } finally {
      setIsAnalysing(false)
    }
  }

  async function handleAuthorise() {
    if (!liveTraceId) {
      setStaticApprovalAcknowledged(true)
      setIsBankIntelligenceOpen(false)
      setStep(6)
      return
    }
    setIsAuthorising(true)
    try {
      const snapshot = await authorisePayment(liveTraceId)
      setPaymentSnapshot(snapshot)
      setIsBankIntelligenceOpen(false)
      setStep(6)
    } catch {
      setIsBankIntelligenceOpen(false)
      setStep(6)
    } finally {
      setIsAuthorising(false)
    }
  }

  async function handleSimulateNext() {
    if (!liveTraceId) return
    setIsSimulating(true)
    try {
      const snapshot = await simulateNext(liveTraceId)
      setPaymentSnapshot(snapshot)
    } finally {
      setIsSimulating(false)
    }
  }

  async function handleSimulateDegradation() {
    if (!liveTraceId) return
    setIsSimulating(true)
    try {
      const snapshot = await simulateDegradation(liveTraceId)
      setPaymentSnapshot(snapshot)
    } finally {
      setIsSimulating(false)
    }
  }

  function handleBack() {
    if (step > 1) {
      setIsBankIntelligenceOpen(false)
      setStep((step - 1) as JourneyStep)
    }
  }

  function handleContinue() {
    if (step < maxUnlockedStep) {
      setIsBankIntelligenceOpen(false)
      setStep((step + 1) as JourneyStep)
    }
  }

  return (
    <main className="app-shell">
      <DisclaimerBanner />
      <header className="app-header">
        <div>
          <p className="eyebrow">Money Movement Intelligence</p>
          <h1>Money Movement Intelligence</h1>
          <p className="header-tagline">Ask to move money. Let the bank find the best safe way.</p>
          <p className="journey-narrative">
            The customer does not choose a rail. They confirm the outcome; the bank evaluates safe movement options.
          </p>
        </div>
        {analysisComplete ? (
          <div className="header-metrics" aria-label="Current selected route metrics">
            <span className="header-chip header-chip-route">{displayTrace.selectedRoute.label}</span>
            <span className="header-chip">ETA {displayTrace.selectedRoute.eta}</span>
            {displayTrace.selectedRoute.score !== undefined && (
              <span className="header-chip">Score {displayTrace.selectedRoute.score.toFixed(0)}/100</span>
            )}
          </div>
        ) : (
          <div className="header-metrics header-session-strip" aria-label="Secure session boundaries">
            <span className="header-chip">Demo environment</span>
            <span className="header-chip">No money moved</span>
            <span className="header-chip">Bank route engine decides</span>
          </div>
        )}
      </header>

      <div className="journey-wrapper">
        <StepIndicator currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={handleStepClick} />

        <section className="stage-shell" aria-label={`Stage ${step}: ${stageTitle(step)}`} key={step}>
          <div className="stage-shell-head">
            <div>
            <p className="eyebrow">Stage {step} of 6</p>
              <h2>{stageTitle(step)}</h2>
              <p>{stageDescription(step)}</p>
            </div>
            <div className="stage-head-actions">
              {analysisComplete && (
                <span className="stage-status">Route recommendation ready</span>
              )}
              <button
                type="button"
                className="bank-intelligence-toggle"
                aria-expanded={isBankIntelligenceOpen}
                aria-controls="bank-intelligence-drawer"
                onClick={() => setIsBankIntelligenceOpen(true)}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Show bank intelligence
              </button>
            </div>
          </div>

          <BankIntelligenceDrawer
            open={isBankIntelligenceOpen}
            stage={step}
            trace={displayTrace}
            provider={explanationProvider}
            structuredIntent={structuredIntent}
            structuredIntentConfirmed={structuredIntentConfirmed}
            structuredIntentFallbackUsed={structuredIntentFallbackUsed}
            analysisNotice={analysisNotice}
            paymentSnapshot={paymentSnapshot}
            approvalAccepted={approvalAccepted}
            customerInsightProfile={demoCustomerInsightProfile}
            useCustomerInsights={useCustomerInsights}
            customerInsightsUsedForAnalysis={customerInsightsUsedForAnalysis}
            onClose={() => setIsBankIntelligenceOpen(false)}
          />

          {step === 1 && (
            <div className="stage-content secure-session-stage">
              <section className="secure-session-landing" aria-label="Secure session landing">
                <div className="secure-session-product-card">
                  <div className="secure-session-visual" aria-hidden="true">
                    <span className="secure-session-ring">
                      <Fingerprint size={38} />
                    </span>
                    <span className="secure-session-scan-line" />
                  </div>
                  <div className="secure-session-copy-block">
                    <p className="eyebrow">Secure banking session</p>
                    <h3>Customer verified. Agent scoped. Execution locked.</h3>
                    <p>
                      Verify the customer, scope the trusted banking agent and lock execution before money movement intent capture.
                      The bank route engine will recommend a safe way only after the customer confirms the intent.
                    </p>
                    <div className="secure-session-boundary">
                      <Bot size={17} aria-hidden="true" />
                      <span>
                        The agent can help structure and explain intent. It cannot approve, execute, amend, cancel, or move money.
                        Final approval remains passkey-protected.
                      </span>
                    </div>
                    <div className="secure-session-actions">
                      <button type="button" className="primary-btn secure-session-primary" onClick={handleContinue}>
                        Continue to Money Movement Intent
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                      <span>Next: speak or type the money movement outcome.</span>
                    </div>
                  </div>
                </div>
                <aside className="secure-readiness-panel" aria-label="Session readiness sequence">
                  <div>
                    <p className="eyebrow">Readiness sequence</p>
                    <h3>Session ready for intent capture</h3>
                  </div>
                  <ol className="secure-readiness-list">
                    {secureReadinessItems.map(({ label, detail, icon: Icon }) => (
                      <li key={label}>
                        <span className="readiness-check"><CheckCircle2 size={15} aria-hidden="true" /></span>
                        <span>
                          <strong>{label}</strong>
                          <small>{detail}</small>
                        </span>
                        <Icon size={17} aria-hidden="true" />
                      </li>
                    ))}
                  </ol>
                </aside>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="stage-content">
              <div className="intent-grid-layout">
                <div>
                  <PaymentIntentIntake
                    scenarios={demoScenarios}
                    intentText={intentText}
                    onIntentTextChange={handleIntentTextChange}
                    onPreferencesChange={setLivePreferences}
                    onScenarioMatch={setScenarioId}
                    onStructureIntent={handleStructureIntent}
                    onConfirmStructuredIntent={() => {
                      if (structuredIntent) {
                        setStructuredIntentConfirmed(true)
                        setAnalyseError(null)
                      } else {
                        setStructureError('Structure the intent before confirming it for route analysis.')
                      }
                    }}
                    structuredIntent={structuredIntent}
                    structuredIntentFallbackUsed={structuredIntentFallbackUsed}
                    structuredIntentWarnings={structuredIntentWarnings}
                    structureError={structureError}
                    isStructuring={isStructuringIntent}
                    structuredIntentConfirmed={structuredIntentConfirmed}
                  />
                </div>
                <div>
                  <PaymentIntentView intent={displayIntent} />
                </div>
              </div>
              <div className="demo-scenario-aside">
                <ScenarioSelector scenarios={demoScenarios} selectedId={scenario.id} onSelect={setScenarioId} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="stage-content">
              <CustomerInsightContext
                profile={demoCustomerInsightProfile}
                useInsights={useCustomerInsights}
                isAnalysing={isAnalysing}
                onUseInsightsChange={setUseCustomerInsights}
                onAnalyse={handleAnalyse}
              />
            </div>
          )}

          {step === 4 && (
            <div className="stage-content">
              {analysisNotice && (
                <div className="static-demo-banner">
                  <strong>Static corridor demo</strong>
                  <span>{analysisNotice}</span>
                </div>
              )}
              <RouteIntelligencePanel
                trace={displayTrace}
                customerInsightsUsed={customerInsightsUsedForAnalysis}
                insightProfile={demoCustomerInsightProfile}
              />
              <RecommendationHeroCard trace={displayTrace} />
              <TrustedAgentExplanationPanel
                trace={displayTrace}
                provider={explanationProvider}
                isLoading={isAnalysing}
                customerInsightsUsed={customerInsightsUsedForAnalysis}
                insightProfile={demoCustomerInsightProfile}
              />
              <DecisionImpactBanner trace={displayTrace} />
              <details className="customer-evidence-details">
                <summary>View detailed route evidence</summary>
                <div className="analysis-grid">
                  <div>
                    <RouteComparison trace={displayTrace} />
                  </div>
                  <div>
                    <DecisionTracePanel
                      trace={displayTrace}
                      provider={explanationProvider}
                      isLoading={isAnalysing}
                    />
                  </div>
                </div>
              </details>
            </div>
          )}

          {step === 5 && (
            <div className="stage-content">
              {analysisNotice && (
                <div className="static-demo-banner">
                  <strong>Static corridor demo</strong>
                  <span>{analysisNotice}</span>
                </div>
              )}
              <div className="stage-focus-card">
                <strong>Journey & Controls map</strong>
                <span>
                  Review the representative money movement journey, control checkpoints and settlement boundaries for the recommended route.
                  Expected journey only — no money has moved.
                </span>
              </div>
              <div className="map-fallback-row">
                <LeafletRouteMap trace={displayTrace} />
                {displayTrace.fallbackEvent && (
                  <FallbackEventView trace={displayTrace} />
                )}
              </div>
              <details className="customer-evidence-details control-band">
                <summary>View control evidence</summary>
                <div className="simulation-panel">
                  <div className="simulation-controls-head">
                    <strong>Control evidence</strong>
                    <span>Internal simulation evidence, not a customer execution action.</span>
                  </div>
                  <ControlRoom trace={displayTrace} paymentState={paymentSnapshot?.state} />
                </div>
              </details>
            </div>
          )}

          {step === 6 && (
            <div className="stage-content execution-section">
              <ApprovalTransitionPanel trace={displayTrace} mode={approvalAccepted ? 'tracking' : 'handoff'} />
              <FinalApprovalCard
                trace={displayTrace}
                intent={displayIntent}
                paymentState={approvalAccepted ? paymentSnapshot?.state ?? 'STATIC_DEMO_APPROVED' : undefined}
              />
              {approvalAccepted ? (
                <div className="payment-state-badge">
                  Payment state: <strong>{paymentSnapshot ? STATE_LABELS[paymentSnapshot.state] ?? paymentSnapshot.state : 'Static demo approval acknowledged'}</strong>
                </div>
              ) : (
                <div className="payment-state-badge" style={{ borderColor: '#fed7aa', background: '#fff7ed', color: '#92400e' }}>
                  Payment not yet approved — customer passkey approval is required
                </div>
              )}
              {!approvalAccepted && (
                <div className="stage-action-row">
                  <p className="approval-mock-note">Passkey approval mocked for demo.</p>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleAuthorise}
                    disabled={isAuthorising}
                  >
                    {isAuthorising ? 'Approving...' : 'Approve with passkey'}
                    {!isAuthorising && <ArrowRight size={16} aria-hidden="true" />}
                  </button>
                </div>
              )}
              <PaymentTracker trace={displayTrace} />
              {liveTraceId && paymentSnapshot &&
                paymentSnapshot.state !== 'COMPLETED' &&
                paymentSnapshot.state !== 'INVESTIGATION_REQUIRED' && (
                  <div className="simulation-controls">
                    <div className="simulation-controls-head">
                      <strong>Simulation controls</strong>
                      <span>Demo-only progression after customer approval.</span>
                    </div>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={handleSimulateNext}
                      disabled={isSimulating}
                    >
                      {isSimulating ? 'Simulating...' : 'Simulate next step'}
                    </button>
                    {!paymentSnapshot.pointOfNoReturnReached && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={handleSimulateDegradation}
                        disabled={isSimulating}
                      >
                        Simulate degradation
                      </button>
                    )}
                  </div>
                )}
            </div>
          )}

          <div className="stage-nav">
            <button type="button" className="secondary-btn" onClick={handleBack} disabled={step === 1}>
              Back
            </button>
            {step === 1 ? (
              <button type="button" className="primary-btn" onClick={handleContinue}>
                Continue to Money Movement Intent
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : step === 2 ? (
              <button
                type="button"
                className="primary-btn"
                onClick={handleContinue}
                disabled={isAnalysing || !intentText.trim() || !structuredIntentConfirmed}
                title={!structuredIntentConfirmed ? 'Confirm the structured intent before customer insight review' : undefined}
              >
                Continue to Customer Insight Context
                {!isAnalysing && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            ) : step === 3 && !analysisComplete ? (
              <span className="stage-nav-note">Choose whether to use customer insight before route analysis.</span>
            ) : step < 6 ? (
              <button type="button" className="primary-btn" onClick={handleContinue}>
                {continueLabel(step)}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="secondary-btn" onClick={handleReset}>
                Start new intent
              </button>
            )}
          </div>

          {(analyseError || classifyReason) && (
            <div className="stage-messages">
              {analyseError && <span className="analyse-error">{analyseError}</span>}
              {classifyReason && (
                <p className="classify-reason">
                  <strong>Intent matched:</strong> {classifyReason}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function stageTitle(step: JourneyStep) {
  switch (step) {
    case 1:
      return 'Secure Session'
    case 2:
      return 'Money Movement Intent'
    case 3:
      return 'Customer Insight Context'
    case 4:
      return 'Route Intelligence'
    case 5:
      return 'Journey & Controls'
    case 6:
      return 'Approval & Tracking'
  }
}

function stageDescription(step: JourneyStep) {
  switch (step) {
    case 1:
      return 'Verify the customer, scope the agent and lock execution before money movement intent capture.'
    case 2:
      return 'Speak or type what the customer wants to do with money, then review the structured intent.'
    case 3:
      return 'Review consented customer context before route analysis.'
    case 4:
      return 'Review the deterministic route recommendation and explanation.'
    case 5:
      return 'Inspect the representative money movement journey, controls and settlement boundaries.'
    case 6:
      return 'Approve with passkey, then track the simulated money movement journey.'
  }
}

function continueLabel(step: JourneyStep) {
  switch (step) {
    case 1:
      return 'Continue to Money Movement Intent'
    case 2:
      return 'Continue'
    case 3:
      return 'Continue to Route Intelligence'
    case 4:
      return 'Continue to Journey & Controls'
    case 5:
      return 'Continue to Approval & Tracking'
    case 6:
      return 'Continue'
  }
}

export default App

function localStructuredIntent(rawText: string, intent: PaymentIntent): ApiStructuredIntent {
  return {
    rawText,
    amount: intent.amount || 'To be confirmed',
    currency: firstCurrency(`${intent.amount} ${intent.destination} ${rawText}`),
    sourceCountry: intent.source || 'To be confirmed',
    source: intent.source || 'To be confirmed',
    destinationCountry: intent.destination || 'To be confirmed',
    beneficiaryType: intent.destination.toLowerCase().includes('wallet') ? 'Digital wallet' : 'Bank account',
    objective: intent.objective,
    trackingRequired: intent.trackingRequired,
    digitalRoutesAllowed: intent.digitalRoutesAllowed,
    traditionalOnly: !intent.digitalRoutesAllowed,
    purpose: intent.constraints[0] ?? 'To be confirmed',
    confidence: 0.62,
    needsReview: true,
    sourceType: 'rules',
    missingFields: [],
  }
}

function firstCurrency(text: string) {
  const match = text.toUpperCase().match(/\b(GBP|USD|USDC|EUR|INR|CNY|AUD|AED)\b/)
  return match?.[1] ?? 'To be confirmed'
}
