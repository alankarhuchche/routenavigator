import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'

vi.mock('../api', () => ({
  createRouteDecision: vi.fn().mockResolvedValue({
    traceId: 'trace-stage-test',
    scenarioId: 'SCN-001',
    customerIntent: {
      objective: 'FASTEST',
      trackingRequired: false,
      digitalRoutesAllowed: false,
      constraints: ['DOMESTIC_ONLY'],
    },
    selectedRoute: {
      routeId: 'route-uk-instant-bank-transfer',
      family: 'UK_DOMESTIC_INSTANT',
      customerLabel: 'Instant UK bank transfer',
      status: 'SELECTED',
      reasons: ['Passed all blocking hard gates.'],
    },
    candidateRoutes: [
      {
        routeId: 'route-uk-instant-bank-transfer',
        family: 'UK_DOMESTIC_INSTANT',
        customerLabel: 'Instant UK bank transfer',
        status: 'SELECTED',
        reasons: ['Passed all blocking hard gates.'],
      },
    ],
    gateResults: [],
    excludedRoutes: [
      {
        routeId: 'route-correspondent-banking',
        family: 'CORRESPONDENT_BANKING',
        customerLabel: 'International bank transfer',
        status: 'EXCLUDED',
        reasons: ['Did not best match confirmed intent and controls.'],
      },
    ],
    pointOfNoReturn: 'On submission to Faster Payments',
    finalityModel: 'Finality depends on route type',
    fallbackCandidate: null,
    aiBoundary: 'Gemini explains only.',
    executionEvents: [],
  }),
  fetchExplanation: vi.fn().mockResolvedValue({
    provider: 'TEMPLATE_FALLBACK',
    geminiEnabled: false,
    explanation: 'Template explanation for the selected route.',
    redactedTrace: {},
  }),
  authorisePayment: vi.fn().mockResolvedValue({
    traceId: 'trace-stage-test',
    state: 'AUTHORISED',
    activeRouteId: 'route-uk-instant-bank-transfer',
    pointOfNoReturnReached: false,
    fallbackApplied: false,
    events: [{ message: 'Authorised', state: 'AUTHORISED', pointOfNoReturnReached: false }],
  }),
  classifyIntent: vi.fn().mockResolvedValue({ scenarioId: 'SCN-001', reason: 'matched demo intent' }),
  simulateNext: vi.fn(),
  simulateDegradation: vi.fn(),
  getPaymentState: vi.fn(),
}))

describe('page-like demo stage shell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows only the active stage and restores the journey map in Stage 3', async () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /speak payment intent/i })).toBeInTheDocument()
    expect(screen.queryByText('Analysing safe routes')).not.toBeInTheDocument()
    expect(screen.queryByText('Payment journey map')).not.toBeInTheDocument()
    expect(screen.queryByText('Route recommendation ready for approval')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Route Intelligence locked until route analysis/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Journey & Controls locked until route analysis/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Approval & Tracking locked until route analysis/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Customer outcome'), {
      target: { value: 'Send GBP 500 to a UK beneficiary as quickly as possible.' },
    })
    expect(screen.getByLabelText('Customer outcome')).toHaveValue('Send GBP 500 to a UK beneficiary as quickly as possible.')
    expect(screen.getByText('Voice captures intent only. Passkey approval is required before anything moves.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /analyse safe routes/i }))

    expect(await screen.findByText('Analysing safe routes')).toBeInTheDocument()
    expect(screen.getByText('Trusted banking agent')).toBeInTheDocument()
    expect(screen.queryByText('Payment journey map')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Journey & Controls$/i })).not.toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))

    expect(await screen.findByText('Payment journey map')).toBeInTheDocument()
    expect(screen.getByText('Journey & Controls map')).toBeInTheDocument()
    expect(screen.getByText('Expected journey only — no money has moved. Final approval is still required.')).toBeInTheDocument()
    expect(screen.getByTestId('map')).toHaveClass('route-map')
    expect(screen.queryByText('Trusted banking agent')).not.toBeInTheDocument()
    expect(screen.queryByText('Route recommendation ready for approval')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Continue to Approval & Tracking/i }))

    await waitFor(() => expect(screen.getByText('Route recommendation ready for approval')).toBeInTheDocument())
    expect(screen.queryByText('Payment journey map')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Approve with passkey$/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Back$/i }))

    expect(await screen.findByText('Payment journey map')).toBeInTheDocument()
    expect(screen.getAllByText('Instant UK bank transfer').length).toBeGreaterThan(0)
  }, 10_000)
})
