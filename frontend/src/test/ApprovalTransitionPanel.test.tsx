import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

    const outcomeInput = screen.getByLabelText('Customer outcome')
    await user.clear(outcomeInput)
    await user.type(outcomeInput, 'Send GBP 5,000 to India in INR with tracking.')
    await user.click(screen.getByRole('button', { name: /confirm and analyse safe routes/i }))

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
})
