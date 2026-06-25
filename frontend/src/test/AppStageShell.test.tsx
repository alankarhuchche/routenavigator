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
  classifyIntent: vi.fn().mockResolvedValue({
    scenarioId: 'SCN-001',
    reason: 'matched demo intent',
    classifiedBy: 'GEMINI',
    structuredIntent: {
      rawText: 'Send GBP 500 to a UK beneficiary as quickly as possible.',
      amount: 'GBP 500',
      currency: 'GBP',
      sourceCountry: 'United Kingdom',
      source: 'UK bank account',
      destinationCountry: 'United Kingdom',
      beneficiaryType: 'Bank account',
      objective: 'FASTEST',
      trackingRequired: false,
      digitalRoutesAllowed: false,
      traditionalOnly: true,
      purpose: 'Supplier payment',
      confidence: 0.82,
      needsReview: true,
      sourceType: 'gemini',
      missingFields: [],
    },
    fallbackUsed: false,
    warnings: ['AI structured this draft intent for customer review.'],
  }),
  simulateNext: vi.fn(),
  simulateDegradation: vi.fn(),
  getPaymentState: vi.fn(),
}))

describe('page-like demo stage shell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows only the active stage and restores the journey map in Stage 4', async () => {
    render(<App />)

    expect(screen.getAllByText('Secure Session').length).toBeGreaterThan(0)
    expect(screen.getByText('Customer verified. Agent scoped. Execution locked.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Continue to Intent Capture/i })[0]).toBeInTheDocument()
    expect(screen.getByText('Session ready for intent capture')).toBeInTheDocument()
    expect(screen.getByText('Device-bound authentication confirmed')).toBeInTheDocument()
    expect(screen.getByText('Trusted banking agent active')).toBeInTheDocument()
    expect(screen.getByText(/Final approval remains passkey-protected/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot approve, execute, amend, cancel, or move money/i)).toBeInTheDocument()
    expect(screen.getByText('No money moved')).toBeInTheDocument()
    expect(screen.getByText('Route engine decides')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /speak payment intent/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Customer outcome')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /objective/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Demo scenarios')).not.toBeInTheDocument()
    expect(screen.queryByText('Analysing safe routes')).not.toBeInTheDocument()
    expect(screen.queryByText('Payment journey map')).not.toBeInTheDocument()
    expect(screen.queryByText('Route recommendation ready for approval')).not.toBeInTheDocument()
    expect(screen.queryByText(/Instant UK bank transferETA/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ETA 2 minScore/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Intent Capture$/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Route Intelligence locked until route analysis/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Journey & Controls locked until route analysis/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Approval & Tracking locked until route analysis/i })).toBeDisabled()

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Intent Capture/i })[0])
    expect(screen.getAllByText('Intent Capture').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /speak payment intent/i })).toBeInTheDocument()
    expect(screen.getByText('Suggested demo intent — review and edit before analysis')).toBeInTheDocument()
    expect(screen.getByText('Demo scenarios')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Customer outcome'), {
      target: { value: 'Send GBP 500 to a UK beneficiary as quickly as possible.' },
    })
    expect(screen.getByLabelText('Customer outcome')).toHaveValue('Send GBP 500 to a UK beneficiary as quickly as possible.')
    expect(screen.getByText('Voice captures intent only. Passkey approval is required before anything moves.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyse safe routes/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    expect(await screen.findByText('AI structured this intent. Review before route analysis.')).toBeInTheDocument()
    expect(screen.getByText('No payment can move from this step. This confirmed intent is used by the route engine. The agent cannot change it or execute the payment.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    expect(screen.getByRole('button', { name: /analyse safe routes/i })).not.toBeDisabled()
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
