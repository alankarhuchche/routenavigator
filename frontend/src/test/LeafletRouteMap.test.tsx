import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LeafletRouteMap } from '../components/LeafletRouteMap'
import type { DecisionTrace, RouteCandidate } from '../types'

function makeTrace(routeId: string): DecisionTrace {
  const selected: RouteCandidate = {
    id: routeId, label: 'Test route', family: 'TEST', status: 'SELECTED',
    eta: '1h', cost: '£1', score: 9, reasons: [],
    coordinates: [[51.5, -0.1], [40.7, -74.0]],
  }
  return {
    traceId: 't1', selectedRoute: selected, candidates: [selected],
    gates: [], scoreDimensions: {}, pointOfNoReturn: '', finality: '',
    fallback: '', aiBoundary: '', explanation: '', events: [],
  }
}

describe('LeafletRouteMap', () => {
  it('renders the map container', () => {
    const { getByTestId } = render(<LeafletRouteMap trace={makeTrace('route-a')} />)
    expect(getByTestId('map')).toBeInTheDocument()
  })

  it('re-mounts the map when the selected route changes (key prop fix)', () => {
    const { rerender, getByTestId } = render(<LeafletRouteMap trace={makeTrace('route-a')} />)
    const firstMap = getByTestId('map')

    rerender(<LeafletRouteMap trace={makeTrace('route-b')} />)
    const secondMap = getByTestId('map')

    // different key → React replaces the node → different DOM element
    expect(firstMap).not.toBe(secondMap)
  })
})
