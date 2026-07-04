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

describe('Approve with passkey button', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('is not visible on step 1', () => {
    render(<App />)
    expect(screen.queryByText(/Approve with passkey/i)).not.toBeInTheDocument()
  })

  it('appears on Approval & Tracking after analysing and continuing through the journey', async () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /use demo example/i }))
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /confirm structured intent/i })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    fireEvent.click(screen.getByRole('button', { name: /Continue to Customer Insight Context/i }))
    expect(screen.getAllByText('Customer Insight Context').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /Use insights and analyse safe routes/i }))
    await waitFor(() => expect(screen.getByText('Analysing the best safe way')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))
    await waitFor(() => expect(screen.getByText('Money movement journey map')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Continue to Approval & Tracking/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /^Approve with passkey$/i })).toBeInTheDocument())
  }, 10_000)

  it('hides after authorise accepts approval in stage 6', async () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /use demo example/i }))
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /confirm structured intent/i })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    fireEvent.click(screen.getByRole('button', { name: /Continue to Customer Insight Context/i }))
    expect(screen.getAllByText('Customer Insight Context').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /Use insights and analyse safe routes/i }))
    await waitFor(() => expect(screen.getByText('Analysing the best safe way')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))
    await waitFor(() => expect(screen.getByText('Money movement journey map')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Continue to Approval & Tracking/i }))
    await waitFor(() => screen.getByRole('button', { name: /^Approve with passkey$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Approve with passkey$/i }))
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Approve with passkey$/i })).not.toBeInTheDocument())
  })
})
