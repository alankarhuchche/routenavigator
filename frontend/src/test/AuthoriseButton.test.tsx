import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

vi.mock('../api', () => ({
  createRouteDecision: vi.fn().mockResolvedValue({
    traceId: 'trace-test',
    selectedRoute: {
      routeId: 'route-uk-instant-bank-transfer',
      family: 'UK_DOMESTIC_INSTANT',
      customerLabel: 'Instant UK bank transfer',
      status: 'SELECTED',
      reasons: [],
    },
    candidateRoutes: [],
    gateResults: [],
    scoreResults: [],
    excludedRoutes: [],
    fallbackCandidate: null,
    pointOfNoReturn: 'On submission',
    finality: 'Same day',
    aiBoundary: 'Explains only',
    executionEvents: [],
  }),
  fetchExplanation: vi.fn().mockResolvedValue({ explanation: 'Test explanation', provider: 'template' }),
  authorisePayment: vi.fn().mockResolvedValue({
    traceId: 'trace-test', state: 'AUTHORISED',
    activeRouteId: 'route-uk-instant-bank-transfer',
    pointOfNoReturnReached: false, fallbackApplied: false,
    events: [{ message: 'Authorised', state: 'AUTHORISED', pointOfNoReturnReached: false }],
  }),
  classifyIntent: vi.fn().mockResolvedValue({ scenarioId: 'SCN-001', reason: 'matched' }),
  simulateNext: vi.fn(),
  simulateDegradation: vi.fn(),
  getPaymentState: vi.fn(),
}))

describe('Authorise & Track button (bug fix: hide after step 3)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('is not visible on step 1', () => {
    render(<App />)
    expect(screen.queryByText(/Authorise & Track/i)).not.toBeInTheDocument()
  })

  it('appears on step 2 after analysing', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Analyse Route/i }))
    await waitFor(() => expect(screen.getByText(/Authorise & Track/i)).toBeInTheDocument())
  })

  it('hides after authorise moves to step 3', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Analyse Route/i }))
    await waitFor(() => screen.getByText(/Authorise & Track/i))
    fireEvent.click(screen.getByText(/Authorise & Track/i))
    await waitFor(() => expect(screen.queryByText(/Authorise & Track/i)).not.toBeInTheDocument())
  })
})
