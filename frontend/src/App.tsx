import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { demoScenarios } from './data/demoData'
import { ControlRoom } from './components/ControlRoom'
import { DisclaimerBanner } from './components/DisclaimerBanner'
import { DecisionTracePanel } from './components/DecisionTracePanel'
import { FallbackEventView } from './components/FallbackEventView'
import { LeafletRouteMap } from './components/LeafletRouteMap'
import { PaymentIntentIntake } from './components/PaymentIntentIntake'
import { PaymentIntentView } from './components/PaymentIntentView'
import { PaymentTracker } from './components/PaymentTracker'
import { RouteComparison } from './components/RouteComparison'
import { ScenarioSelector } from './components/ScenarioSelector'
import { StepIndicator } from './components/StepIndicator'
import { ArrowRight } from 'lucide-react'
import type { DecisionTrace } from './types'
import type { ApiPaymentSnapshot } from './apiTypes'
import { createRouteDecision, fetchExplanation, authorisePayment, simulateNext, simulateDegradation, classifyIntent } from './api'
import { adaptTrace } from './traceAdapter'
import type { LivePreferences } from './components/PaymentIntentIntake'

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

  const displayTrace = liveTrace ?? scenario.trace

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

  async function handleAnalyse() {
    setIsAnalysing(true)
    setAnalyseError(null)
    setClassifyReason(null)
    try {
      // Step 1: classify the intent text to pick the best scenario
      let resolvedScenarioId = scenario.id
      if (intentText.trim()) {
        try {
          const classified = await classifyIntent(intentText)
          resolvedScenarioId = classified.scenarioId
          setClassifyReason(classified.reason)
          setScenarioId(classified.scenarioId)
        } catch {
          // classification failed — use current scenario
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

  useEffect(() => {
    if (paymentSnapshot && liveTrace) {
      setLiveTrace(prev => prev ? {
        ...prev,
        events: paymentSnapshot.events.length > 0
          ? paymentSnapshot.events.map(e => e.message)
          : prev.events
      } : prev)
    }
  }, [paymentSnapshot])

  return (
    <main className="app-shell">
      <DisclaimerBanner />
      <header className="app-header">
        <div>
          <p className="eyebrow">Payment Route Orchestrator</p>
          <h1>Route Navigator</h1>
        </div>
        <div className="header-metrics" aria-label="Current selected route metrics">
          <span>{displayTrace.selectedRoute.label}</span>
          <strong>{displayTrace.selectedRoute.family}</strong>
        </div>
      </header>

      <div className="journey-wrapper">
        <StepIndicator currentStep={step} onStepClick={handleStepClick} />

        {/* ── STEP 1: INTENT ── */}
        <section className="step-section" aria-label="Step 1: Intent">
          <div className="intent-grid-layout">
            <div>
              <PaymentIntentIntake
                scenarios={demoScenarios}
                onIntentTextChange={setIntentText}
                onPreferencesChange={setLivePreferences}
              />
            </div>
            <div>
              <ScenarioSelector scenarios={demoScenarios} selectedId={scenario.id} onSelect={setScenarioId} />
            </div>
          </div>

          {/* Payment Intent summary card */}
          <div className="intent-summary-row">
            <PaymentIntentView intent={displayIntent} />
          </div>

          {step === 1 && (
            <div className="step-action-row">
              {analyseError && (
                <span className="analyse-error">{analyseError}</span>
              )}
              <button
                type="button"
                className="primary-btn"
                onClick={handleAnalyse}
                disabled={isAnalysing}
              >
                {isAnalysing ? 'Analysing...' : 'Analyse Route'}
                {!isAnalysing && <ArrowRight size={16} aria-hidden="true" />}
              </button>
              {classifyReason && (
                <p className="classify-reason">
                  <strong>AI matched:</strong> {classifyReason}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── STEP 2: ROUTE ANALYSIS ── */}
        {step >= 2 && (
          <section className="step-section" aria-label="Step 2: Route Analysis">
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
              <div className="step-action-row">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleAuthorise}
                  disabled={isAuthorising}
                >
                  {isAuthorising ? 'Authorising...' : 'Authorise & Track'}
                  {!isAuthorising && <ArrowRight size={16} aria-hidden="true" />}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── STEP 3: EXECUTION ── */}
        {step >= 3 && (
          <section className="step-section execution-section" aria-label="Step 3: Execution">
            {paymentSnapshot && (
              <div className="payment-state-badge">
                Payment state: <strong>{paymentSnapshot.state}</strong>
              </div>
            )}
            <PaymentTracker trace={displayTrace} />
            {liveTraceId && paymentSnapshot &&
              paymentSnapshot.state !== 'COMPLETED' &&
              paymentSnapshot.state !== 'INVESTIGATION_REQUIRED' && (
                <div className="step-action-row">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleSimulateNext}
                    disabled={isSimulating}
                  >
                    {isSimulating ? 'Simulating...' : 'Simulate Next Step'}
                  </button>
                  {!paymentSnapshot.pointOfNoReturnReached && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={handleSimulateDegradation}
                      disabled={isSimulating}
                    >
                      Simulate Degradation
                    </button>
                  )}
                </div>
              )}
            <div className="control-band">
              <ControlRoom trace={displayTrace} paymentState={paymentSnapshot?.state} />
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default App
