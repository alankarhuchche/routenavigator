import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from '../App'

describe('Bank Intelligence drawer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is closed by default, opens and closes from Secure Session', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /show bank intelligence/i })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: /secure session controls/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))

    const drawer = screen.getByRole('dialog', { name: /secure session controls/i })
    expect(within(drawer).getByText('Passkey verified')).toBeInTheDocument()
    expect(within(drawer).getByText('Device/session trust confirmed')).toBeInTheDocument()
    expect(within(drawer).getByText(/Approve/)).toBeInTheDocument()
    expect(within(drawer).getByText(/Move money/)).toBeInTheDocument()

    fireEvent.click(within(drawer).getByRole('button', { name: /close bank intelligence/i }))
    expect(screen.queryByRole('dialog', { name: /secure session controls/i })).not.toBeInTheDocument()
  })

  it('shows stage-specific behind-the-scenes context through the five-stage journey', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('force local/static demo path'))))
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /continue to money movement intent/i })[0])
    expect(screen.getByRole('button', { name: /show bank intelligence/i })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: /intent structuring context/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    let drawer = screen.getByRole('dialog', { name: /intent structuring context/i })
    expect(within(drawer).getByText('Browser SpeechRecognition')).toBeInTheDocument()
    expect(within(drawer).getByText('No raw audio uploaded')).toBeInTheDocument()
    expect(within(drawer).getByText('/api/intent/classify')).toBeInTheDocument()
    expect(within(drawer).getByText(/Structured intent is a draft/i)).toBeInTheDocument()
    fireEvent.click(within(drawer).getByRole('button', { name: /close bank intelligence/i }))

    fireEvent.change(screen.getByLabelText('Money movement outcome'), {
      target: { value: 'Send GBP 5,000 to India in INR with tracking.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    await waitFor(() => expect(screen.getAllByText(/structured this intent/i).length).toBeGreaterThan(0))
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    fireEvent.click(screen.getByRole('button', { name: /analyse safe routes/i }))

    expect(await screen.findByText('Analysing the best safe way')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    drawer = screen.getByRole('dialog', { name: /route recommendation evidence/i })
    expect(within(drawer).getByText('Route engine owns recommendation')).toBeInTheDocument()
    expect(within(drawer).getByText('Demo explanation only')).toBeInTheDocument()
    expect(within(drawer).getByText(/AI cannot choose or approve/i)).toBeInTheDocument()
    fireEvent.click(within(drawer).getByRole('button', { name: /close bank intelligence/i }))

    fireEvent.click(screen.getByRole('button', { name: /continue to journey & controls/i }))
    expect(await screen.findByText('Money movement journey map')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    drawer = screen.getByRole('dialog', { name: /journey and controls evidence/i })
    expect(within(drawer).getByText('Representative journey')).toBeInTheDocument()
    expect(within(drawer).getByText('Not live telemetry')).toBeInTheDocument()
    expect(within(drawer).getByText(/No real correspondent data/i)).toBeInTheDocument()
    fireEvent.click(within(drawer).getByRole('button', { name: /close bank intelligence/i }))

    fireEvent.click(screen.getByRole('button', { name: /continue to approval & tracking/i }))
    expect(await screen.findByText('Route recommendation ready for approval')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show bank intelligence/i }))
    drawer = screen.getByRole('dialog', { name: /approval and tracking evidence/i })
    expect(within(drawer).getByText('Customer/passkey approval required')).toBeInTheDocument()
    expect(within(drawer).getByText('Simulation only')).toBeInTheDocument()
    expect(within(drawer).getByText(/does not connect to real rails/i)).toBeInTheDocument()
  }, 10_000)
})
