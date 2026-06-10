import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentIntentView } from '../components/PaymentIntentView'
import type { PaymentIntent } from '../types'

const intent: PaymentIntent = {
  amount: 'GBP 500',
  source: 'UK bank',
  destination: 'UK beneficiary',
  objective: 'FASTEST',
  trackingRequired: true,
  digitalRoutesAllowed: false,
  constraints: ['Domestic only'],
}

describe('PaymentIntentView', () => {
  it('renders amount, source and destination', () => {
    render(<PaymentIntentView intent={intent} />)
    expect(screen.getByText('GBP 500')).toBeInTheDocument()
    expect(screen.getByText('UK bank')).toBeInTheDocument()
    expect(screen.getByText('UK beneficiary')).toBeInTheDocument()
  })

  it('shows Required when tracking is needed', () => {
    render(<PaymentIntentView intent={intent} />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('shows Optional when tracking is not needed', () => {
    render(<PaymentIntentView intent={{ ...intent, trackingRequired: false }} />)
    expect(screen.getByText('Optional')).toBeInTheDocument()
  })
})
