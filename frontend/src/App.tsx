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

function App() {
  const [scenarioId, setScenarioId] = useState(demoScenarios[0].id)
  const scenario = useMemo(
    () => demoScenarios.find((candidate) => candidate.id === scenarioId) ?? demoScenarios[0],
    [scenarioId],
  )

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

      <section className="control-band" aria-label="Control room">
        <ControlRoom trace={scenario.trace} />
      </section>

      <section className="workspace">
        <aside className="left-rail" aria-label="Scenario and payment intent">
          <PaymentIntentIntake scenarios={demoScenarios} selectedScenario={scenario} onScenarioMatched={setScenarioId} />
          <ScenarioSelector scenarios={demoScenarios} selectedId={scenario.id} onSelect={setScenarioId} />
          <PaymentIntentView intent={scenario.intent} />
        </aside>

        <section className="main-panel" aria-label="Route comparison">
          <RouteComparison trace={scenario.trace} />
          <LeafletRouteMap trace={scenario.trace} />
          <FallbackEventView trace={scenario.trace} />
          <PaymentTracker trace={scenario.trace} />
        </section>

        <aside className="right-rail" aria-label="Decision Trace">
          <DecisionTracePanel trace={scenario.trace} />
        </aside>
      </section>
    </main>
  )
}

export default App
