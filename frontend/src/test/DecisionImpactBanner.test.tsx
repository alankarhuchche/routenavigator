import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DecisionImpactBanner, etaToMinutes } from '../components/DecisionImpactBanner'
import type { DecisionTrace, RouteCandidate } from '../types'

function makeCandidate(id: string, label: string, status: RouteCandidate['status'], eta: string): RouteCandidate {
  return { id, label, family: 'TEST', status, eta, cost: 'Low', score: status === 'EXCLUDED' ? undefined : 80, reasons: [], coordinates: [] }
}

function makeTrace(selectedEta: string, otherEta: string): DecisionTrace {
  const selected = makeCandidate('r1', 'Fast route', 'SELECTED', selectedEta)
  return {
    traceId: 't1',
    selectedRoute: selected,
    candidates: [selected, makeCandidate('r2', 'Slow route', 'AVAILABLE', otherEta)],
    gates: [
      { routeLabel: 'Fast route', gate: 'Universal hard gates', result: 'PASS', reason: 'ok' },
      { routeLabel: 'Slow route', gate: 'Universal hard gates', result: 'PASS', reason: 'ok' },
    ],
    scoreDimensions: {},
    pointOfNoReturn: 'On transfer',
    finality: 'Irrevocable',
    fallback: 'None',
    aiBoundary: 'Explains only',
    explanation: '',
    events: [],
  }
}

describe('etaToMinutes', () => {
  it('parses minutes, hours, ranges and days to upper-bound minutes', () => {
    expect(etaToMinutes('2 min')).toBe(2)
    expect(etaToMinutes('38 min')).toBe(38)
    expect(etaToMinutes('4 hr')).toBe(240)
    expect(etaToMinutes('2-4 hr')).toBe(240)
    expect(etaToMinutes('1-2 days')).toBe(2880)
    expect(etaToMinutes('1 day')).toBe(1440)
    expect(etaToMinutes('unknown')).toBeNull()
  })
})

describe('DecisionImpactBanner', () => {
  it('shows the speed advantage versus the slowest compliant route', () => {
    render(<DecisionImpactBanner trace={makeTrace('38 min', '1-2 days')} />)
    expect(screen.getByText(/76× faster/)).toBeInTheDocument()
  })

  it('shows route and gate counts', () => {
    render(<DecisionImpactBanner trace={makeTrace('38 min', '1-2 days')} />)
    expect(screen.getByText(/2 routes evaluated/)).toBeInTheDocument()
    expect(screen.getByText(/2 compliance & eligibility checks/)).toBeInTheDocument()
  })

  it('omits the advantage when the selected route is the slowest', () => {
    render(<DecisionImpactBanner trace={makeTrace('1-2 days', '38 min')} />)
    expect(screen.queryByText(/faster than/)).not.toBeInTheDocument()
  })
})
