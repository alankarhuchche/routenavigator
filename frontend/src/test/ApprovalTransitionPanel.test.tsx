import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('Approval step transition', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('unexpected backend call'))))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('separates route recommendation handoff from approval tracking', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getAllByText('Secure Intent').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Route Intelligence/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Journey & Controls/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Approval & Tracking/i })).toBeDisabled()

    const outcomeInput = screen.getByLabelText('Customer outcome')
    fireEvent.change(outcomeInput, { target: { value: 'Send GBP 5,000 to India in INR with tracking.' } })
    await user.click(screen.getByRole('button', { name: /confirm and analyse safe routes/i }))

    expect(await screen.findByText('Analysing safe routes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Journey & Controls$/i })).not.toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))

    expect(await screen.findByText('Payment journey map')).toBeInTheDocument()
    expect(screen.getByText('Expected journey only — no money has moved. Final approval is still required.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continue to Approval & Tracking/i }))

    expect(await screen.findByRole('region', { name: /approval handoff/i })).toBeInTheDocument()
    expect(screen.getByText('Route recommendation ready for approval')).toBeInTheDocument()
    expect(screen.getByText(/Final customer approval is still required before simulated execution/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot approve, execute, amend, cancel or move money/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /approve with passkey/i }))

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /approval accepted/i })).toBeInTheDocument()
    })
    expect(screen.getByText('Approval accepted in simulation')).toBeInTheDocument()
    expect(screen.getAllByText('Tracking after approval').length).toBeGreaterThan(0)
  })

  it('preserves route state when navigating back and forward between stages', async () => {
    const user = userEvent.setup()

    render(<App />)

    fireEvent.change(screen.getByLabelText('Customer outcome'), {
      target: { value: 'Send GBP 5,000 to India in INR with tracking.' },
    })
    await user.click(screen.getByRole('button', { name: /confirm and analyse safe routes/i }))

    await screen.findByText(/using static frontend route trace/i)
    await user.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))
    await screen.findByText('Payment journey map')

    await user.click(screen.getByRole('button', { name: /^Back$/i }))
    expect(await screen.findByText('Analysing safe routes')).toBeInTheDocument()
    expect(screen.getByText(/using static frontend route trace/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continue to Journey & Controls/i }))
    expect(await screen.findByText('Payment journey map')).toBeInTheDocument()
  })
})
