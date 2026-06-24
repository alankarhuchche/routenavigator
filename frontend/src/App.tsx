import { useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { demoScenarios } from './data/demoData'
import { ControlRoom } from './components/ControlRoom'
import { ApprovalTransitionPanel } from './components/ApprovalTransitionPanel'
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
import { TrustedSessionBanner } from './components/TrustedSessionBanner'
import { TrustedAgentExplanationPanel } from './components/TrustedAgentExplanationPanel'
import { ArrowRight, BadgeCheck, Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { DecisionTrace } from './types'
import type { ApiPaymentSnapshot } from './apiTypes'
import { createRouteDecision, fetchExplanation, authorisePayment, simulateNext, simulateDegradation, classifyIntent } from './api'
import { adaptTrace } from './traceAdapter'
import type { LivePreferences } from './components/PaymentIntentIntake'
import { STATE_LABELS } from './stateLabels'

type JourneyStep = 1 | 2 | 3 | 4 | 5

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
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [analyseError, setAnalyseError] = useState<string | null>(null)
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null)
  const [paymentSnapshot, setPaymentSnapshot] = useState<ApiPaymentSnapshot | null>(null)
  const [staticApprovalAcknowledged, setStaticApprovalAcknowledged] = useState(false)
  const [isAuthorising, setIsAuthorising] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

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
    if (!livePreferences) return base
    return {
      ...base,
      objective: livePreferences.objective,
      trackingRequired: livePreferences.trackingRequired,
      digitalRoutesAllowed: livePreferences.digitalRoutesAllowed,
    }
  }, [scenario.intent, livePreferences])

  const maxUnlockedStep: JourneyStep = analysisComplete ? 5 : 2
  const approvalAccepted = Boolean(paymentSnapshot) || staticApprovalAcknowledged

  function handleStepClick(s: number) {
    if ((s === 1 || s === 2 || s === 3 || s === 4 || s === 5) && s <= maxUnlockedStep) {
      setStep(s as JourneyStep)
    }
  }

  function handleReset() {
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
  }

  async function handleAnalyse() {
    if (!intentText.trim()) {
      setAnalyseError('Enter a payment outcome before analysing safe routes.')
      return
    }
    setIsAnalysing(true)
    setAnalyseError(null)
    setAnalysisNotice(null)
    setClassifyReason(null)
    setPaymentSnapshot(null)
    setStaticApprovalAcknowledged(false)
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
        setStep(3)
        return
      }
      if (intentText.trim()) {
        try {
          const classified = await classifyIntent(intentText)
          setClassifyReason(classified.reason)
        } catch {
          // classification failed — reason text omitted, scenario unchanged
        }
      }
      // Step 2: run route decision + Gemini explanation
      const apiTrace = await createRouteDecision(resolvedScenarioId)
      const explanationResp = await fetchExplanation(apiTrace.traceId)
      const matchedScenario = demoScenarios.find(s => s.id === resolvedScenarioId) ?? scenario
      const adapted = adaptTrace(apiTrace, matchedScenario, explanationResp.explanation)
      setLiveTraceId(apiTrace.traceId)
      setLiveTrace(adapted)
      setExplanationProvider(explanationResp.provider)
      setAnalysisComplete(true)
      setStep(3)
    } catch {
      setAnalyseError('Analysis failed — using demo data')
      setAnalysisComplete(true)
      setStep(3)
    } finally {
      setIsAnalysing(false)
    }
  }

  async function handleAuthorise() {
    if (!liveTraceId) {
      setStaticApprovalAcknowledged(true)
      setStep(5)
      return
    }
    setIsAuthorising(true)
    try {
      const snapshot = await authorisePayment(liveTraceId)
      setPaymentSnapshot(snapshot)
      setStep(5)
    } catch {
      setStep(5)
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
      setStep((step - 1) as JourneyStep)
    }
  }

  function handleContinue() {
    if (step < maxUnlockedStep) {
      setStep((step + 1) as JourneyStep)
    }
  }

  return (
    <main className="app-shell">
      <DisclaimerBanner />
      <header className="app-header">
        <div>
          <p className="eyebrow">Payment Route Intelligence</p>
          <h1>Payment Route Intelligence</h1>
          <p className="header-tagline">Express the outcome. Let the bank recommend the safest executable route.</p>
          <p className="journey-narrative">
            Customers no longer need to choose rails. They confirm the outcome; the bank evaluates safe routes.
          </p>
        </div>
        <div className="header-metrics" aria-label="Current selected route metrics">
          <span className="header-chip header-chip-route">{displayTrace.selectedRoute.label}</span>
          <span className="header-chip">ETA {displayTrace.selectedRoute.eta}</span>
          {displayTrace.selectedRoute.score !== undefined && (
            <span className="header-chip">Score {displayTrace.selectedRoute.score.toFixed(0)}/100</span>
          )}
        </div>
      </header>

      <div className="journey-wrapper">
        <StepIndicator currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={handleStepClick} />

        <section className="stage-shell" aria-label={`Stage ${step}: ${stageTitle(step)}`} key={step}>
          <div className="stage-shell-head">
            <div>
              <p className="eyebrow">Stage {step} of 5</p>
              <h2>{stageTitle(step)}</h2>
              <p>{stageDescription(step)}</p>
            </div>
            {analysisComplete && (
              <span className="stage-status">Route recommendation ready</span>
            )}
          </div>

          {step === 1 && (
            <div className="stage-content">
              <div className="secure-session-hero" aria-label="Secure session readiness">
                <div className="secure-session-emblem" aria-hidden="true">
                  <Fingerprint size={30} />
                </div>
                <div>
                  <p className="eyebrow">Passkey session ready</p>
                  <h3>Customer verified. Agent scoped. Execution locked.</h3>
                  <p>
                    Verify the customer, scope the agent and lock execution before payment intent capture.
                    The agent can help structure and explain intent. It cannot approve, execute, amend, cancel, or move money.
                  </p>
                </div>
              </div>
              <TrustedSessionBanner />
              <div className="secure-readiness-grid" aria-label="Session verification sequence">
                <div>
                  <BadgeCheck size={18} aria-hidden="true" />
                  <strong>Passkey verified</strong>
                  <span>Device-bound authentication confirmed</span>
                </div>
                <div>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <strong>Consent scoped</strong>
                  <span>Route advice only</span>
                </div>
                <div>
                  <LockKeyhole size={18} aria-hidden="true" />
                  <strong>Execution locked</strong>
                  <span>Final approval required</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stage-content">
              <div className="intent-grid-layout">
                <div>
                  <PaymentIntentIntake
                    scenarios={demoScenarios}
                    intentText={intentText}
                    onIntentTextChange={setIntentText}
                    onPreferencesChange={setLivePreferences}
                    onScenarioMatch={setScenarioId}
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
              {analysisNotice && (
                <div className="static-demo-banner">
                  <strong>Static corridor demo</strong>
                  <span>{analysisNotice}</span>
                </div>
              )}
              <RouteIntelligencePanel trace={displayTrace} />
              <RecommendationHeroCard trace={displayTrace} />
              <TrustedAgentExplanationPanel
                trace={displayTrace}
                provider={explanationProvider}
                isLoading={isAnalysing}
              />
              <DecisionImpactBanner trace={displayTrace} />
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
              <div className="stage-focus-card">
                <strong>Journey & Controls map</strong>
                <span>
                  Review the representative journey, control checkpoints and settlement boundaries for the recommended route.
                  Expected journey only — no money has moved.
                </span>
              </div>
              <div className="map-fallback-row">
                <LeafletRouteMap trace={displayTrace} />
                {displayTrace.fallbackEvent && (
                  <FallbackEventView trace={displayTrace} />
                )}
              </div>
              <div className="control-band simulation-panel">
                <div className="simulation-controls-head">
                  <strong>Control evidence</strong>
                  <span>Internal simulation evidence, not a customer execution action.</span>
                </div>
                <ControlRoom trace={displayTrace} paymentState={paymentSnapshot?.state} />
              </div>
            </div>
          )}

          {step === 5 && (
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
                Continue to Intent Capture
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : step === 2 ? (
              <button
                type="button"
                className="primary-btn"
                onClick={handleAnalyse}
                disabled={isAnalysing || !intentText.trim()}
              >
                {isAnalysing ? 'Analysing...' : 'Analyse safe routes'}
                {!isAnalysing && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            ) : step < 5 ? (
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
      return 'Intent Capture'
    case 3:
      return 'Route Intelligence'
    case 4:
      return 'Journey & Controls'
    case 5:
      return 'Approval & Tracking'
  }
}

function stageDescription(step: JourneyStep) {
  switch (step) {
    case 1:
      return 'Verify the customer, scope the agent and lock execution before payment intent capture.'
    case 2:
      return 'Speak or type the payment outcome, then review it before route analysis.'
    case 3:
      return 'Review the deterministic route recommendation and explanation.'
    case 4:
      return 'Inspect the representative journey, controls and settlement boundaries.'
    case 5:
      return 'Approve with passkey, then track the simulated payment journey.'
  }
}

function continueLabel(step: JourneyStep) {
  switch (step) {
    case 1:
      return 'Continue to Intent Capture'
    case 2:
      return 'Continue'
    case 3:
      return 'Continue to Journey & Controls'
    case 4:
      return 'Continue to Approval & Tracking'
    case 5:
      return 'Continue'
  }
}

export default App
