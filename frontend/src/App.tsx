import { useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { demoScenarios } from './data/demoData'
import { ControlRoom } from './components/ControlRoom'
import { DisclaimerBanner } from './components/DisclaimerBanner'
import { DecisionImpactBanner } from './components/DecisionImpactBanner'
import { DecisionTracePanel } from './components/DecisionTracePanel'
import { FallbackEventView } from './components/FallbackEventView'
import { FinalApprovalCard } from './components/FinalApprovalCard'
import { LeafletRouteMap } from './components/LeafletRouteMap'
import { PaymentIntentIntake } from './components/PaymentIntentIntake'
import { PaymentIntentView } from './components/PaymentIntentView'
import { PaymentTracker } from './components/PaymentTracker'
import { RecommendationHeroCard } from './components/RecommendationHeroCard'
import { RouteComparison } from './components/RouteComparison'
import { RouteIntelligencePanel } from './components/RouteIntelligencePanel'
import { ScenarioSelector } from './components/ScenarioSelector'
import { StepIndicator } from './components/StepIndicator'
import { TrustedSessionBanner } from './components/TrustedSessionBanner'
import { ArrowRight } from 'lucide-react'
import type { DecisionTrace } from './types'
import type { ApiPaymentSnapshot } from './apiTypes'
import { createRouteDecision, fetchExplanation, authorisePayment, simulateNext, simulateDegradation, classifyIntent } from './api'
import { adaptTrace } from './traceAdapter'
import type { LivePreferences } from './components/PaymentIntentIntake'
import { STATE_LABELS } from './stateLabels'

function App() {
  const [scenarioId, setScenarioId] = useState(demoScenarios[0].id)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [liveTraceId, setLiveTraceId] = useState<string | null>(null)
  const [liveTrace, setLiveTrace] = useState<DecisionTrace | null>(null)
  const [explanationProvider, setExplanationProvider] = useState<string | undefined>(undefined)
  const [intentText, setIntentText] = useState('')
  const [livePreferences, setLivePreferences] = useState<LivePreferences | null>(null)
  const [classifyReason, setClassifyReason] = useState<string | null>(null)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [analyseError, setAnalyseError] = useState<string | null>(null)
  const [paymentSnapshot, setPaymentSnapshot] = useState<ApiPaymentSnapshot | null>(null)
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

  function handleStepClick(s: number) {
    if (s === 1 || s === 2 || s === 3) {
      setStep(s as 1 | 2 | 3)
    }
  }

  function handleReset() {
    setStep(1)
    setLiveTrace(null)
    setLiveTraceId(null)
    setPaymentSnapshot(null)
    setClassifyReason(null)
    setAnalyseError(null)
    setExplanationProvider(undefined)
  }

  async function handleAnalyse() {
    setIsAnalysing(true)
    setAnalyseError(null)
    setClassifyReason(null)
    setPaymentSnapshot(null)
    try {
      // Use the client-side matched scenario as authoritative source.
      // The backend classifier only supplies the reason text — it predates
      // the full corridor set and would override correct client matches.
      const resolvedScenarioId = scenarioId
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
      setStep(2)
    } catch {
      setAnalyseError('Analysis failed — using demo data')
      setStep(2)
    } finally {
      setIsAnalysing(false)
    }
  }

  async function handleAuthorise() {
    if (!liveTraceId) { setStep(3); return }
    setIsAuthorising(true)
    try {
      const snapshot = await authorisePayment(liveTraceId)
      setPaymentSnapshot(snapshot)
      setStep(3)
    } catch {
      setStep(3)
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
        <StepIndicator currentStep={step} onStepClick={(s) => { if (s === 1) handleReset(); else handleStepClick(s) }} />

        {/* ── STEP 1: INTENT ── */}
        <section className="step-section" aria-label="Step 1: Intent">
          {step === 1 && <TrustedSessionBanner />}
          <div className="intent-grid-layout">
            <div>
              <PaymentIntentIntake
                scenarios={demoScenarios}
                onIntentTextChange={setIntentText}
                onPreferencesChange={setLivePreferences}
                onScenarioMatch={setScenarioId}
              />
            </div>
            <div>
              <ScenarioSelector scenarios={demoScenarios} selectedId={scenario.id} onSelect={setScenarioId} />
            </div>
          </div>

          {step === 1 && (
            <div className="sticky-action-bar">
              {analyseError && (
                <span className="analyse-error">{analyseError}</span>
              )}
              {classifyReason && (
                <p className="classify-reason">
                  <strong>Intent matched:</strong> {classifyReason}
                </p>
              )}
              <button
                type="button"
                className="primary-btn"
                onClick={handleAnalyse}
                disabled={isAnalysing}
              >
                {isAnalysing ? 'Analysing...' : 'Confirm and analyse safe routes'}
                {!isAnalysing && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            </div>
          )}

          {/* Payment Intent summary card */}
          <div className="intent-summary-row">
            <PaymentIntentView intent={displayIntent} />
          </div>
        </section>

        {/* ── STEP 2: ROUTE ANALYSIS ── */}
        {step >= 2 && (
          <section className="step-section" aria-label="Step 2: Route Analysis">
            {step === 2 && (
              <div className="edit-intent-row">
                <button type="button" className="ghost-btn" onClick={handleReset}>
                  ← Edit intent
                </button>
              </div>
            )}
            <RouteIntelligencePanel trace={displayTrace} />
            <RecommendationHeroCard trace={displayTrace} />
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

            <div className="map-fallback-row">
              <LeafletRouteMap trace={displayTrace} />
              {displayTrace.fallbackEvent && (
                <FallbackEventView trace={displayTrace} />
              )}
            </div>

            {step < 3 && (
              <div className="approval-handoff">
                <FinalApprovalCard trace={displayTrace} intent={displayIntent} />
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
          </section>
        )}

        {/* ── STEP 3: EXECUTION ── */}
        {step >= 3 && (
          <section className="step-section execution-section" aria-label="Step 3: Approval & Tracking">
            <FinalApprovalCard
              trace={displayTrace}
              intent={displayIntent}
              paymentState={paymentSnapshot?.state}
            />
            {paymentSnapshot ? (
              <div className="payment-state-badge">
                Payment state: <strong>{STATE_LABELS[paymentSnapshot.state] ?? paymentSnapshot.state}</strong>
              </div>
            ) : (
              <div className="payment-state-badge" style={{ borderColor: '#fed7aa', background: '#fff7ed', color: '#92400e' }}>
                Payment not yet approved — click <strong>Approve with passkey</strong> in step 2
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
            <div className="control-band simulation-panel">
              <div className="simulation-controls-head">
                <strong>Demo control room</strong>
                <span>Internal simulation evidence, not a customer execution action.</span>
              </div>
              <ControlRoom trace={displayTrace} paymentState={paymentSnapshot?.state} />
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default App
