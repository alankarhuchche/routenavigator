import { ListChecks } from 'lucide-react'
import type { DemoScenario } from '../types'

interface ScenarioSelectorProps {
  scenarios: DemoScenario[]
  selectedId: string
  onSelect: (scenarioId: string) => void
}

export function ScenarioSelector({ scenarios, selectedId, onSelect }: ScenarioSelectorProps) {
  return (
    <section className="panel">
      <div className="panel-title">
        <ListChecks size={18} aria-hidden="true" />
        <h2>Scenarios</h2>
      </div>
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
    </section>
  )
}
