import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../App'

describe('Secure Session initial visibility', () => {
  it('renders a visible first stage and opens Intent Capture from the primary CTA', () => {
    expect(() => render(<App />)).not.toThrow()

    expect(screen.getAllByText('Secure Session').length).toBeGreaterThan(0)
    expect(screen.getByText('Stage 1 of 5')).toBeInTheDocument()
    expect(screen.getByText('Customer verified. Agent scoped. Execution locked.')).toBeInTheDocument()
    expect(screen.getByText('Session ready for intent capture')).toBeInTheDocument()
    expect(screen.getByText('Device-bound authentication confirmed')).toBeInTheDocument()
    expect(screen.getByText(/cannot approve, execute, amend, cancel, or move money/i)).toBeInTheDocument()
    expect(screen.getByText(/Final approval remains passkey-protected/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Continue to Intent Capture/i }).length).toBeGreaterThan(0)
    expect(screen.queryByLabelText('Customer outcome')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /speak payment intent/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Intent Capture/i })[0])

    expect(screen.getAllByText('Intent Capture').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Customer outcome')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /speak payment intent/i })).toBeInTheDocument()
  })
})
