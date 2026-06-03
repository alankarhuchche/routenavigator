import type { GateResult } from '../types'

export function GateResultTable({ gates }: { gates: GateResult[] }) {
  return (
    <div className="gate-table">
      {gates.slice(0, 8).map((gate, index) => (
        <div className={`gate-row ${gate.result.toLowerCase()}`} key={`${gate.routeLabel}-${gate.gate}-${index}`}>
          <span>{gate.routeLabel}</span>
          <span>{gate.gate}</span>
          <strong>{gate.result}</strong>
        </div>
      ))}
    </div>
  )
}
