import { useMemo, useState } from 'react'
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

function App() {
  const [scenarioId, setScenarioId] = useState(demoScenarios[0].id)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const scenario = useMemo(
    () => demoScenarios.find((candidate) => candidate.id === scenarioId) ?? demoScenarios[0],
    [scenarioId],
  )

  function handleScenarioMatched(id: string) {
    setScenarioId(id)
    setStep(2)
  }

  function handleStepClick(s: number) {
    if (s === 1 || s === 2 || s === 3) {
      setStep(s as 1 | 2 | 3)
    }
  }

  return (
    <main className="app-shell">
      <DisclaimerBanner />
      <header className="app-header">
        <div>
          <p className="eyebrow">Payment Route Orchestrator</p>
          <h1>Route Navigator</h1>
        </div>
        <div className="header-metrics" aria-label="Current selected route metrics">
          <span>{scenario.trace.selectedRoute.label}</span>
          <strong>{scenario.trace.selectedRoute.family}</strong>
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
                selectedScenario={scenario}
                onScenarioMatched={handleScenarioMatched}
              />
            </div>
            <div>
              <ScenarioSelector scenarios={demoScenarios} selectedId={scenario.id} onSelect={setScenarioId} />
            </div>
          </div>

          {/* Payment Intent summary card */}
          <div className="intent-summary-row">
            <PaymentIntentView intent={scenario.intent} />
          </div>

          <div className="step-action-row">
            <button
              type="button"
              className="primary-btn"
              onClick={() => setStep(2)}
            >
              Analyse Route
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* ── STEP 2: ROUTE ANALYSIS ── */}
        {step >= 2 && (
          <section className="step-section" aria-label="Step 2: Route Analysis">
            <div className="analysis-grid">
              <div>
                <RouteComparison trace={scenario.trace} />
              </div>
              <div>
                <DecisionTracePanel trace={scenario.trace} />
              </div>
            </div>

            <div className="map-fallback-row">
              <LeafletRouteMap trace={scenario.trace} />
              {scenario.trace.fallbackEvent && (
                <FallbackEventView trace={scenario.trace} />
              )}
            </div>

            <div className="step-action-row">
              <button
                type="button"
                className="primary-btn"
                onClick={() => setStep(3)}
              >
                Authorise &amp; Track
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 3: EXECUTION ── */}
        {step >= 3 && (
          <section className="step-section execution-section" aria-label="Step 3: Execution">
            <PaymentTracker trace={scenario.trace} />
            <div className="control-band">
              <ControlRoom trace={scenario.trace} />
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default App
