import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from '../App'

function mockBackendFallback() {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('demo fallback'))))
}

async function reachInsightStage() {
  render(<App />)
  fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])
  fireEvent.change(screen.getByLabelText('Money movement outcome'), {
    target: { value: 'Send GBP 5,000 to India in INR with tracking.' },
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

    expect(screen.getByText('Stage 1 of 6')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Customer Insight Context locked until prior stage is complete/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Route Intelligence locked until prior stage is complete/i })).toBeDisabled()

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])
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
  }, 10_000)

  it('analyses with customer insight and shows insight considered in Route Intelligence', async () => {
    mockBackendFallback()
    await reachInsightStage()

    fireEvent.click(screen.getByRole('button', { name: /Use insights and analyse safe routes/i }))

    expect(await screen.findByText('Analysing the best safe way')).toBeInTheDocument()
    expect(screen.getByText('Customer insight considered')).toBeInTheDocument()
    expect(screen.getByText('Why this fits your money movement')).toBeInTheDocument()
    expect(screen.getAllByText(/This looks like family support/i).length).toBeGreaterThan(1)
    expect(screen.getAllByText(/within the usual movement range/i).length).toBeGreaterThan(1)
    expect(screen.getAllByText(/beneficiary is a previously paid beneficiary/i).length).toBeGreaterThan(1)
    expect(screen.getByText(/Customer insight can explain fit and future ranking/i)).toBeInTheDocument()
    expect(screen.getByText(/profile-aware scoring is planned for a later phase/i)).toBeInTheDocument()
    expect(screen.getByText('Customer-fit explanation')).toBeInTheDocument()
    expect(screen.getByText(/Customer-fit reasoning is explanation-only/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const drawer = screen.getByRole('dialog', { name: /route recommendation evidence/i })
    expect(within(drawer).getByText('Yes, as context only')).toBeInTheDocument()
    expect(within(drawer).getByText('Not implemented yet')).toBeInTheDocument()
    expect(within(drawer).getByText('None in Phase 4D')).toBeInTheDocument()
    expect(within(drawer).getByText(/cannot override fraud, sanctions, limits, eligibility or regulatory controls/i)).toBeInTheDocument()
  })

  it('analyses without customer insight and keeps no-real-data boundary visible in the drawer', async () => {
    mockBackendFallback()
    await reachInsightStage()

    fireEvent.click(screen.getByLabelText('Use customer insight for this analysis'))
    expect(screen.getByLabelText('Use customer insight for this analysis')).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: /Analyse without customer insight/i }))

    expect(await screen.findByText('Analysing the best safe way')).toBeInTheDocument()
    expect(screen.getByText('Customer insight not used for this analysis')).toBeInTheDocument()
    expect(screen.getByText('Customer insight was not used for this analysis.')).toBeInTheDocument()
    expect(screen.getByText(/No customer profile context was applied/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const drawer = screen.getByRole('dialog', { name: /route recommendation evidence/i })
    expect(within(drawer).getByText('No')).toBeInTheDocument()

    fireEvent.click(within(drawer).getByRole('button', { name: /close bank intelligence/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Customer Insight Context$/i }))
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    const insightDrawer = screen.getByRole('dialog', { name: /customer insight evidence/i })
    expect(within(insightDrawer).getByText('Demo/static customer profile')).toBeInTheDocument()
    expect(within(insightDrawer).getByText('No real customer data used')).toBeInTheDocument()
    expect(within(insightDrawer).getByText('No external services called')).toBeInTheDocument()
  }, 10_000)
})
