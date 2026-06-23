import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { ScenarioSelector } from '../components/ScenarioSelector'
import { demoScenarios } from '../data/demoData'

describe('static corridor demo scenarios', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('unexpected backend call'))))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('labels frontend-only corridor examples as illustrative demos', () => {
    render(<ScenarioSelector scenarios={demoScenarios} selectedId="SCN-001" onSelect={() => undefined} />)

    expect(screen.getAllByText('Illustrative corridor demo')).toHaveLength(5)
    expect(screen.getByText('SCN-001').closest('button')).not.toHaveTextContent('Illustrative corridor demo')
    expect(screen.getByText('SCN-007').closest('button')).toHaveTextContent('Illustrative corridor demo')
  })

  it('uses the static trace for corridor demos without calling backend route endpoints', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.mocked(globalThis.fetch)

    render(<App />)

    const outcomeInput = screen.getByLabelText('Customer outcome')
    await user.clear(outcomeInput)
    await user.type(outcomeInput, 'Send GBP 5,000 to India in INR with tracking.')

    await waitFor(() => {
      expect(screen.getAllByText('GBP to India (INR)').length).toBeGreaterThan(0)
    })

    await user.click(screen.getByRole('button', { name: /confirm and analyse safe routes/i }))

    await screen.findByText(/using static frontend route trace/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
