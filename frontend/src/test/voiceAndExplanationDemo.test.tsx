import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PaymentIntentIntake } from '../components/PaymentIntentIntake'
import { TrustedAgentExplanationPanel } from '../components/TrustedAgentExplanationPanel'
import { demoScenarios } from '../data/demoData'
import type { DecisionTrace, RouteCandidate } from '../types'

const originalSpeechSynthesisDescriptor = Object.getOwnPropertyDescriptor(window, 'speechSynthesis')

afterEach(() => {
  if (originalSpeechSynthesisDescriptor) {
    Object.defineProperty(window, 'speechSynthesis', originalSpeechSynthesisDescriptor)
  } else {
    Reflect.deleteProperty(window, 'speechSynthesis')
  }
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('voice intent capture demo', () => {
  it('keeps typed controlled intent text after rerender', () => {
    const onIntentTextChange = vi.fn()
    const { rerender } = render(
      <PaymentIntentIntake
        scenarios={demoScenarios}
        intentText="Send GBP 1,000 to a supplier in Germany."
        onIntentTextChange={onIntentTextChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('Customer outcome'), {
      target: { value: 'Send GBP 2,500 to a supplier in Germany with tracking.' },
    })

    expect(onIntentTextChange).toHaveBeenCalledWith('Send GBP 2,500 to a supplier in Germany with tracking.')

    rerender(
      <PaymentIntentIntake
        scenarios={demoScenarios}
        intentText="Send GBP 2,500 to a supplier in Germany with tracking."
        onIntentTextChange={onIntentTextChange}
      />,
    )

    expect(screen.getByLabelText('Customer outcome')).toHaveValue('Send GBP 2,500 to a supplier in Germany with tracking.')
  })

  it('shows usable objective options and accessible preference cards', () => {
    render(<PaymentIntentIntake scenarios={demoScenarios} />)

    expect(screen.getByText('Intent Capture')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /objective/i })).toHaveValue('FASTEST')
    expect(screen.getByRole('option', { name: 'Fastest' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Cheapest' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Most transparent' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tracking required')).toBeChecked()
    expect(screen.getByLabelText('Digital routes allowed')).toBeChecked()
    expect(screen.getByLabelText('Traditional bank transfer only')).not.toBeChecked()
    expect(screen.getByText('Voice captures intent only. Passkey approval is required before anything moves.')).toBeInTheDocument()
  })

  it('shows a safe unsupported fallback when speech recognition is unavailable', () => {
    render(<PaymentIntentIntake scenarios={demoScenarios} />)

    const voiceButton = screen.getByRole('button', { name: /speak payment intent/i })
    expect(voiceButton).toBeDisabled()
    expect(screen.getByText('Voice captures intent only. Passkey approval is still required before anything moves.')).toBeInTheDocument()
    expect(screen.getByText('Voice captures intent only. Passkey approval is required before anything moves.')).toBeInTheDocument()
  })

  it('captures mocked speech into the editable payment intent field only', () => {
    class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ''
      onstart: (() => void) | null = null
      onresult: ((event: { results: { transcript: string }[][] }) => void) | null = null
      onerror: (() => void) | null = null
      onend: (() => void) | null = null

      start() {
        this.onstart?.()
        this.onresult?.({ results: [[{ transcript: 'Send GBP 5,000 to India in INR with tracking.' }]] })
        this.onend?.()
      }
    }

    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition)

    render(<PaymentIntentIntake scenarios={demoScenarios} />)

    fireEvent.click(screen.getByRole('button', { name: /speak payment intent/i }))

    expect(screen.getByLabelText('Customer outcome')).toHaveValue('Send USD 10,000 from my UK bank account to a US bank account. Fastest route, tracking required, digital routes allowed. Send GBP 5,000 to India in INR with tracking.')
    expect(screen.getByText(/Voice intent captured/i)).toBeInTheDocument()
    expect(screen.getByText(/voice cannot approve or execute payments/i)).toBeInTheDocument()
  })
})

describe('trusted agent explanation panel', () => {
  it('labels a genuine Gemini provider without giving Gemini route authority', () => {
    render(<TrustedAgentExplanationPanel trace={trace} provider="GEMINI" />)

    expect(screen.getByText('Trusted banking agent')).toBeInTheDocument()
    expect(screen.getByText('Gemini explanation')).toBeInTheDocument()
    expect(screen.getByText(/deterministic route engine decides/i)).toBeInTheDocument()
    expect(screen.getByText(/approve with passkey before anything moves/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot approve, execute, amend, cancel or move money/i)).toBeInTheDocument()
    expect(screen.queryByText(/Gemini chose/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/voice approved/i)).not.toBeInTheDocument()
  })

  it('shows fallback status and safely disables read-aloud when browser speech is unavailable', () => {
    render(<TrustedAgentExplanationPanel trace={{ ...trace, explanation: '' }} provider="TEMPLATE_FALLBACK" />)

    expect(screen.getByText('Demo fallback explanation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /read explanation aloud/i })).toBeDisabled()
    expect(screen.getByText(/Browser read-aloud is unavailable/i)).toBeInTheDocument()
  })

  it('reads the explanation aloud using browser text-to-speech when available', () => {
    const speak = vi.fn()
    const cancel = vi.fn()
    class MockUtterance {
      text: string
      onend: (() => void) | null = null
      onerror: (() => void) | null = null

      constructor(text: string) {
        this.text = text
      }
    }

    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak, cancel },
    })

    render(<TrustedAgentExplanationPanel trace={trace} provider="TEMPLATE_FALLBACK_GEMINI_ENABLED" />)

    fireEvent.click(screen.getByRole('button', { name: /read explanation aloud/i }))

    expect(speak).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/browser text-to-speech only/i)).toBeInTheDocument()
  })
})

function makeCandidate(id: string, label: string, status: RouteCandidate['status']): RouteCandidate {
  return { id, label, family: 'TEST', status, eta: '1h', cost: 'Low', score: 90, reasons: ['Passed controls.'], coordinates: [] }
}

const trace: DecisionTrace = {
  traceId: 'trace-demo',
  selectedRoute: makeCandidate('route-a', 'Instant UK bank transfer', 'SELECTED'),
  candidates: [
    makeCandidate('route-a', 'Instant UK bank transfer', 'SELECTED'),
    makeCandidate('route-b', 'Alternative route', 'EXCLUDED'),
  ],
  gates: [],
  scoreDimensions: {},
  pointOfNoReturn: 'Before release',
  finality: 'Finality depends on route type',
  fallback: 'No fallback needed',
  aiBoundary: 'Gemini explains only.',
  explanation: 'The route engine recommended Instant UK bank transfer because it passed controls and best matched the confirmed intent.',
  events: [],
}
