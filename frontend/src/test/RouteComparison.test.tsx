import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouteComparison } from '../components/RouteComparison'
import type { DecisionTrace, RouteCandidate } from '../types'

function makeCandidate(id: string, label: string, status: RouteCandidate['status']): RouteCandidate {
  return { id, label, family: 'TEST', status, eta: '1h', cost: '£1', score: status === 'EXCLUDED' ? undefined : 8.5, reasons: [], coordinates: [] }
}

const trace: DecisionTrace = {
  traceId: 't1',
  selectedRoute: makeCandidate('r1', 'Fast route', 'SELECTED'),
  candidates: [
    makeCandidate('r1', 'Fast route', 'SELECTED'),
    makeCandidate('r2', 'Cheap route', 'AVAILABLE'),
    makeCandidate('r3', 'Blocked route', 'EXCLUDED'),
  ],
  gates: [],
  scoreDimensions: {},
  pointOfNoReturn: 'On transfer',
  finality: 'Irrevocable',
  fallback: 'None',
  aiBoundary: 'Explains only',
  explanation: '',
  events: [],
}

describe('RouteComparison', () => {
  it('renders all candidate routes', () => {
    render(<RouteComparison trace={trace} />)
    expect(screen.getByText('Fast route')).toBeInTheDocument()
    expect(screen.getByText('Cheap route')).toBeInTheDocument()
    expect(screen.getByText('Blocked route')).toBeInTheDocument()
  })

  it('shows SELECTED, AVAILABLE and EXCLUDED status labels', () => {
    render(<RouteComparison trace={trace} />)
    expect(screen.getByText('SELECTED')).toBeInTheDocument()
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument()
    expect(screen.getByText('EXCLUDED')).toBeInTheDocument()
  })

  it('shows a dash for score on excluded route', () => {
    render(<RouteComparison trace={trace} />)
    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBeGreaterThan(0)
  })
})
