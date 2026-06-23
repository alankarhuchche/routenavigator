import { ListChecks } from 'lucide-react'
import type { DemoScenario } from '../types'

interface ScenarioSelectorProps {
  scenarios: DemoScenario[]
  selectedId: string
  onSelect: (scenarioId: string) => void
}

export function ScenarioSelector({ scenarios, selectedId, onSelect }: ScenarioSelectorProps) {
  return (
    <details className="panel demo-scenarios-panel">
      <summary className="panel-title demo-scenarios-summary">
        <ListChecks size={18} aria-hidden="true" />
        <span>
          <h2>Demo scenarios</h2>
          <p>Use these to load pre-built payment journeys for the executive demo.</p>
        </span>
      </summary>
      <div className="scenario-list">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={scenario.id === selectedId ? 'scenario-button active' : 'scenario-button'}
            onClick={() => onSelect(scenario.id)}
          >
            <span>{scenario.id}</span>
            <strong>{scenario.name}</strong>
          </button>
        ))}
      </div>
    </details>
  )
}
