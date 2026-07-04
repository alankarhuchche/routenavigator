import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from '../App'
import { classifyIntent } from '../api'

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
    scoreResults: [
      {
        routeId: 'route-uk-instant-bank-transfer',
        totalScore: 98,
        dimensions: { speed: 98, cost: 95, certainty: 95, transparency: 75 },
        reasons: ['Illustrative base dimensions.'],
        baseScore: 88,
        customerFitAdjustment: 10,
        finalScore: 98,
        customerFitReasons: ['+2 - Purpose fit favours certainty.', '+2 - High speed preference favours a faster eligible route.'],
        customerFitCapApplied: true,
        insightUsed: true,
        scoringVersion: 'customer-fit-v1-demo',
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
    expect(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0]).toBeInTheDocument()
    expect(screen.getByText('Session ready for intent capture')).toBeInTheDocument()
    expect(screen.getByText('Device-bound authentication confirmed')).toBeInTheDocument()
    expect(screen.getByText('Trusted banking agent active')).toBeInTheDocument()
    expect(screen.getByText(/Final approval remains passkey-protected/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot approve, execute, amend, cancel, or move money/i)).toBeInTheDocument()
    expect(screen.getByText('No money moved')).toBeInTheDocument()
    expect(screen.getByText('Bank route engine decides')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /speak money movement intent/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Money movement outcome')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /objective/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Demo scenarios')).not.toBeInTheDocument()
    expect(screen.queryByText('Analysing the best safe way')).not.toBeInTheDocument()
    expect(screen.queryByText('Money movement journey map')).not.toBeInTheDocument()
    expect(screen.queryByText('Route recommendation ready for approval')).not.toBeInTheDocument()
    expect(screen.queryByText(/Instant UK bank transferETA/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/ETA 2 minScore/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Money Movement Intent$/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Customer Insight Context locked until prior stage is complete/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Route Intelligence locked until prior stage is complete/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Journey & Controls locked until prior stage is complete/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Approval & Tracking locked until prior stage is complete/i })).toBeDisabled()

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])
    expect(screen.getAllByText('Money Movement Intent').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /speak money movement intent/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Money movement outcome')).toHaveValue('')
    expect(screen.getByRole('button', { name: /use demo example/i })).toBeInTheDocument()
    expect(screen.queryByText(/Demo example — review or edit before structuring/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Here's what I understood/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Structured intent preview')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /confirm structured intent/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Captured transcript review')).not.toBeInTheDocument()
    expect(vi.mocked(classifyIntent)).not.toHaveBeenCalled()
    expect(screen.getByText('Demo scenarios')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /use demo example/i }))
    expect(screen.getByLabelText('Money movement outcome')).toHaveValue('Send USD 10,000 from my UK bank account to a US bank account. Fastest route, tracking required, digital routes allowed.')
    expect(screen.getByText('Demo example — review or edit before structuring.')).toBeInTheDocument()
    expect(vi.mocked(classifyIntent)).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Money movement outcome'), {
      target: { value: 'Send GBP 500 to a UK beneficiary as quickly as possible.' },
    })
    expect(screen.getByLabelText('Money movement outcome')).toHaveValue('Send GBP 500 to a UK beneficiary as quickly as possible.')
    expect(screen.getByText(/Passkey approval is still required before anything moves/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue to Customer Insight Context/i })).toBeDisabled()
    expect(vi.mocked(classifyIntent)).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    expect(vi.mocked(classifyIntent)).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('AI structured this intent. Review before route analysis.')).toBeInTheDocument()
    expect(screen.getByText('No payment can move from this step. This confirmed intent is used by the route engine. The agent cannot change it or execute the payment.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    expect(screen.getByRole('button', { name: /Continue to Customer Insight Context/i })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Continue to Customer Insight Context/i }))
    expect(screen.getAllByText('Customer Insight Context').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /Use insights and analyse safe routes/i }))

    expect(await screen.findByText('Analysing the best safe way')).toBeInTheDocument()
    expect(screen.getByText('Base score')).toBeInTheDocument()
    expect(screen.getByText('Customer fit')).toBeInTheDocument()
    expect(screen.getByText('Final score')).toBeInTheDocument()
    expect(screen.getByText('+10.0')).toBeInTheDocument()
    expect(screen.getByText(/bounded fit adjustment after controls passed/i)).toBeInTheDocument()
    expect(screen.getByText('Trusted banking agent')).toBeInTheDocument()
    expect(screen.queryByText('Money movement journey map')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Journey & Controls$/i })).not.toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const routeDrawer = screen.getByRole('dialog', { name: /route recommendation evidence/i })
    expect(within(routeDrawer).getByText('88.00')).toBeInTheDocument()
    expect(within(routeDrawer).getByText('+10.00')).toBeInTheDocument()
    expect(within(routeDrawer).getByText('98.00')).toBeInTheDocument()
    expect(within(routeDrawer).getByText('Yes, bounded at +10 / -5')).toBeInTheDocument()
    expect(within(routeDrawer).getByText(/Hard controls passed first/i)).toBeInTheDocument()
    expect(within(routeDrawer).getByText(/Gemini did not score or select/i)).toBeInTheDocument()
    fireEvent.click(within(routeDrawer).getByRole('button', { name: /close bank intelligence/i }))

    fireEvent.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))

    expect(await screen.findByText('Money movement journey map')).toBeInTheDocument()
    expect(screen.getByText('Journey & Controls map')).toBeInTheDocument()
    expect(screen.getByText('Expected journey only — no money has moved. Final approval is still required.')).toBeInTheDocument()
    expect(screen.getByTestId('map')).toHaveClass('route-map')
    expect(screen.queryByText('Trusted banking agent')).not.toBeInTheDocument()
    expect(screen.queryByText('Route recommendation ready for approval')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Continue to Approval & Tracking/i }))

    await waitFor(() => expect(screen.getByText('Route recommendation ready for approval')).toBeInTheDocument())
    expect(screen.queryByText('Money movement journey map')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Approve with passkey$/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Back$/i }))

    expect(await screen.findByText('Money movement journey map')).toBeInTheDocument()
    expect(screen.getAllByText('Instant UK bank transfer').length).toBeGreaterThan(0)
  }, 10_000)
})
