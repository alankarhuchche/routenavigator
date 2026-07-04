import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from '../App'

function mockBackendFallback() {
  const fetchMock = vi.fn((...request: [RequestInfo | URL, RequestInit?]) => {
    void request
    return Promise.reject(new Error('demo fallback'))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function reachInsightStage() {
  render(<App />)
  fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])
  fireEvent.change(screen.getByLabelText('Money movement outcome'), {
    target: { value: 'Send GBP 500 to a UK beneficiary as quickly as possible.' },
  })
  fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
  await waitFor(() => expect(screen.getAllByText(/structured this intent/i).length).toBeGreaterThan(0))
  fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
  fireEvent.click(screen.getByRole('button', { name: /Continue to Customer Insight Context/i }))
}

describe('Customer Insight Context stage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds a locked six-stage journey and renders consented insight cards after intent confirmation', async () => {
    mockBackendFallback()
    render(<App />)

    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Customer Insight Context locked until prior stage is complete/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Route Intelligence locked until prior stage is complete/i })).toBeDisabled()

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /use demo example/i }))
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    await waitFor(() => expect(screen.getAllByText(/structured this intent/i).length).toBeGreaterThan(0))
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))

    expect(screen.getByRole('button', { name: /^Customer Insight Context$/i })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Continue to Customer Insight Context/i }))

    expect(screen.getAllByText('Customer Insight Context').length).toBeGreaterThan(0)
    expect(screen.getByText('Purpose detected')).toBeInTheDocument()
    expect(screen.getByText('Usual movement pattern')).toBeInTheDocument()
    expect(screen.getByText('Beneficiary relationship')).toBeInTheDocument()
    expect(screen.getByText('Previous route experience')).toBeInTheDocument()
    expect(screen.getByText('Risk normality')).toBeInTheDocument()
    expect(screen.getByLabelText('Use customer insight for this analysis')).toBeChecked()
    expect(screen.getByText(/Customer insight can help personalise eligible route ranking after bank controls pass/i)).toBeInTheDocument()
    expect(screen.queryByText(/future phase|visible context only|can inform ranking later/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const drawer = screen.getByRole('dialog', { name: /customer insight evidence/i })
    expect(within(drawer).getByText('Bounded customer-fit scoring active')).toBeInTheDocument()
    expect(within(drawer).getByText(/capped adjustment applies only to AVAILABLE routes after hard controls pass/i)).toBeInTheDocument()
  }, 10_000)

  it('analyses with customer insight and shows insight considered in Route Intelligence', async () => {
    const fetchMock = mockBackendFallback()
    await reachInsightStage()

    fireEvent.click(screen.getByRole('button', { name: /Use insights and analyse safe routes/i }))

    expect(await screen.findByText('Analysing the best safe way')).toBeInTheDocument()
    expect(screen.getByText('Customer insight considered')).toBeInTheDocument()
    expect(screen.getByText('Why this fits your money movement')).toBeInTheDocument()
    expect(screen.getAllByText(/This looks like family support/i).length).toBeGreaterThan(1)
    expect(screen.getAllByText(/within the usual movement range/i).length).toBeGreaterThan(1)
    expect(screen.getAllByText(/beneficiary is a previously paid beneficiary/i).length).toBeGreaterThan(1)
    expect(screen.getByText(/Customer insight was requested, but this demo trace has no scoring evidence/i)).toBeInTheDocument()
    expect(screen.getByText('Customer-fit explanation')).toBeInTheDocument()
    expect(screen.getByText(/agent cannot approve, execute, amend, cancel or move money.*cannot score or rank routes/i)).toBeInTheDocument()
    const routeDecisionCall = fetchMock.mock.calls.find(([input]) => input === '/api/route-decisions')
    const requestBody = JSON.parse(String(routeDecisionCall?.[1]?.body))
    expect(requestBody.customerInsightUsed).toBe(true)
    expect(requestBody.customerInsightContext.insightSource).toBe('Demo customer profile')
    expect(requestBody.customerInsightContext.consentForPersonalisedRouting).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const drawer = screen.getByRole('dialog', { name: /route recommendation evidence/i })
    expect(within(drawer).getByText('Requested; scoring evidence unavailable')).toBeInTheDocument()
    expect(within(drawer).getByText(/Hard controls passed first.*cannot rescue an excluded route/i)).toBeInTheDocument()
  })

  it('analyses without customer insight and keeps no-real-data boundary visible in the drawer', async () => {
    const fetchMock = mockBackendFallback()
    await reachInsightStage()

    fireEvent.click(screen.getByLabelText('Use customer insight for this analysis'))
    expect(screen.getByLabelText('Use customer insight for this analysis')).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: /Analyse without customer insight/i }))

    expect(await screen.findByText('Analysing the best safe way')).toBeInTheDocument()
    expect(screen.getByText('Customer insight not used for this analysis')).toBeInTheDocument()
    expect(screen.getByText('Customer insight was not used for this analysis.')).toBeInTheDocument()
    expect(screen.getByText(/No customer-fit scoring was applied; adjustment is 0/i)).toBeInTheDocument()
    const routeDecisionCall = fetchMock.mock.calls.find(([input]) => input === '/api/route-decisions')
    const requestBody = JSON.parse(String(routeDecisionCall?.[1]?.body))
    expect(requestBody.customerInsightUsed).toBe(false)
    expect(requestBody.customerInsightContext).toBeUndefined()
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const drawer = screen.getByRole('dialog', { name: /route recommendation evidence/i })
    const insightUsedFact = within(drawer).getByText('Insight used').closest('div')
    expect(insightUsedFact).not.toBeNull()
    expect(within(insightUsedFact as HTMLElement).getByText('No')).toBeInTheDocument()

    fireEvent.click(within(drawer).getByRole('button', { name: /close bank intelligence/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Customer Insight Context$/i }))
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const insightDrawer = screen.getByRole('dialog', { name: /customer insight evidence/i })
    expect(within(insightDrawer).getByText('Demo/static customer profile')).toBeInTheDocument()
    expect(within(insightDrawer).getByText('No real customer data used')).toBeInTheDocument()
    expect(within(insightDrawer).getByText('No external services called')).toBeInTheDocument()
  }, 10_000)
})
