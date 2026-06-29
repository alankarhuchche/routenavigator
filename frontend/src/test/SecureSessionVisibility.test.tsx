import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../App'

describe('Secure Session initial visibility', () => {
  it('renders a visible first stage and opens Money Movement Intent from the primary CTA', () => {
    expect(() => render(<App />)).not.toThrow()

    expect(screen.getAllByText('Secure Session').length).toBeGreaterThan(0)
    expect(screen.getByText('Stage 1 of 6')).toBeInTheDocument()
    expect(screen.getByText('Customer verified. Agent scoped. Execution locked.')).toBeInTheDocument()
    expect(screen.getByText('Session ready for intent capture')).toBeInTheDocument()
    expect(screen.getByText('Device-bound authentication confirmed')).toBeInTheDocument()
    expect(screen.getByText(/cannot approve, execute, amend, cancel, or move money/i)).toBeInTheDocument()
    expect(screen.getByText(/Final approval remains passkey-protected/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i }).length).toBeGreaterThan(0)
    expect(screen.queryByLabelText('Money movement outcome')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /speak money movement intent/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /Continue to Money Movement Intent/i })[0])

    expect(screen.getAllByText('Money Movement Intent').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Money movement outcome')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /speak money movement intent/i })).toBeInTheDocument()
  })
})
