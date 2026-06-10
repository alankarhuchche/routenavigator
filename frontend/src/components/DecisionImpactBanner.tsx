import { Zap, ShieldCheck, GitCompareArrows, Undo2 } from 'lucide-react'
import type { DecisionTrace } from '../types'

/** Parse ETA strings like "2 min", "38 min", "4 hr", "2-4 hr", "1-2 days" into upper-bound minutes. */
export function etaToMinutes(eta: string): number | null {
  const match = eta.match(/(\d+)(?:\s*-\s*(\d+))?\s*(min|hr|day)/i)
  if (!match) return null
  const upper = Number(match[2] ?? match[1])
  const unit = match[3].toLowerCase()
  if (unit === 'min') return upper
  if (unit === 'hr') return upper * 60
  return upper * 24 * 60
}

function formatAdvantage(selectedMin: number, slowestMin: number): string | null {
  if (slowestMin <= selectedMin) return null
  const ratio = slowestMin / selectedMin
  if (ratio >= 2) return `${Math.round(ratio)}× faster than the slowest compliant route`
  const savedHours = Math.round((slowestMin - selectedMin) / 60)
  return savedHours >= 1 ? `${savedHours} hr faster than the slowest compliant route` : null
}

export function DecisionImpactBanner({ trace }: { trace: DecisionTrace }) {
  const selected = trace.selectedRoute
  const evaluated = trace.candidates.length
  const excluded = trace.candidates.filter((c) => c.status === 'EXCLUDED').length
  const gatesChecked = trace.gates.length

  const selectedMin = etaToMinutes(selected.eta)
  const slowestMin = Math.max(
    ...trace.candidates
      .map((c) => etaToMinutes(c.eta))
      .filter((m): m is number => m !== null),
  )
  const advantage =
    selectedMin !== null && Number.isFinite(slowestMin)
      ? formatAdvantage(selectedMin, slowestMin)
      : null

  const ponrOpen = !trace.fallbackEvent?.pointOfNoReturnReached

  return (
    <div className="impact-banner" role="status" aria-label="Decision summary">
      <div className="impact-headline">
        <Zap size={20} aria-hidden="true" />
        <div>
          <strong>{selected.label}</strong>
          <span>
            delivers in <em>{selected.eta}</em>
            {advantage ? <> — {advantage}</> : null}
          </span>
        </div>
      </div>
      <div className="impact-stats">
        <span className="impact-stat">
          <GitCompareArrows size={14} aria-hidden="true" />
          {evaluated} routes evaluated · {excluded} excluded
        </span>
        <span className="impact-stat">
          <ShieldCheck size={14} aria-hidden="true" />
          {gatesChecked} compliance &amp; eligibility checks run
        </span>
        <span className="impact-stat">
          <Undo2 size={14} aria-hidden="true" />
          {ponrOpen ? 'Cancellable until point of no return' : 'Point of no return reached'}
        </span>
      </div>
    </div>
  )
}
