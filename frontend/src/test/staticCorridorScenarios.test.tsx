import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    const fetchMock = vi.mocked(globalThis.fetch)

    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Intent Capture/i })[0])
    const outcomeInput = screen.getByLabelText('Customer outcome')
    fireEvent.change(outcomeInput, { target: { value: 'Send GBP 5,000 to India in INR with tracking.' } })

    await waitFor(() => {
      expect(screen.getAllByText('GBP to India (INR)').length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    await waitFor(() => expect(screen.getAllByText(/Demo fallback structured this intent/i).length).toBeGreaterThan(0))
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    fireEvent.click(screen.getByRole('button', { name: /analyse safe routes/i }))

    await screen.findByText(/using static frontend route trace/i)
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/api/route-decisions'))).toBe(false)
  })
})
