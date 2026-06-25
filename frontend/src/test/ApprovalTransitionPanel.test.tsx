import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('Approval step transition', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('unexpected backend call'))))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('separates route recommendation handoff from approval tracking', async () => {
    render(<App />)

    expect(screen.getAllByText('Secure Session').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /^Intent Capture$/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Route Intelligence locked until route analysis/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Journey & Controls locked until route analysis/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Approval & Tracking locked until route analysis/i })).toBeDisabled()

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Intent Capture/i })[0])
    const outcomeInput = screen.getByLabelText('Customer outcome')
    fireEvent.change(outcomeInput, { target: { value: 'Send GBP 5,000 to India in INR with tracking.' } })
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    await waitFor(() => expect(screen.getAllByText(/structured this intent/i).length).toBeGreaterThan(0))
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    fireEvent.click(screen.getByRole('button', { name: /analyse safe routes/i }))

    expect(await screen.findByText('Analysing safe routes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Journey & Controls$/i })).not.toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))

    expect(await screen.findByText('Payment journey map')).toBeInTheDocument()
    expect(screen.getByText('Expected journey only — no money has moved. Final approval is still required.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Continue to Approval & Tracking/i }))

    expect(await screen.findByRole('region', { name: /approval handoff/i })).toBeInTheDocument()
    expect(screen.getByText('Route recommendation ready for approval')).toBeInTheDocument()
    expect(screen.getByText(/Final customer approval is still required before simulated execution/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot approve, execute, amend, cancel or move money/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /approve with passkey/i }))

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /approval accepted/i })).toBeInTheDocument()
    })
    expect(screen.getByText('Approval accepted in simulation')).toBeInTheDocument()
    expect(screen.getAllByText('Tracking after approval').length).toBeGreaterThan(0)
  }, 10_000)

  it('preserves route state when navigating back and forward between stages', async () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Intent Capture/i })[0])
    fireEvent.change(screen.getByLabelText('Customer outcome'), {
      target: { value: 'Send GBP 5,000 to India in INR with tracking.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    await waitFor(() => expect(screen.getAllByText(/structured this intent/i).length).toBeGreaterThan(0))
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    fireEvent.click(screen.getByRole('button', { name: /analyse safe routes/i }))

    await screen.findByText(/using static frontend route trace/i)
    fireEvent.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))
    await screen.findByText('Payment journey map')

    fireEvent.click(screen.getByRole('button', { name: /^Back$/i }))
    expect(await screen.findByText('Recommended: Best chance of compliant INR receipt')).toBeInTheDocument()
    expect(screen.getByText(/using static frontend route trace/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))
    expect(await screen.findByText('Payment journey map')).toBeInTheDocument()
  }, 10_000)
})
