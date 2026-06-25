import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    expect(screen.getByText('Speech recognition is not supported in this browser. Type the payment intent instead.')).toBeInTheDocument()
    expect(screen.getByText('Voice captures intent only. Passkey approval is required before anything moves.')).toBeInTheDocument()
  })

  it('shows live captions and requires confirmation before structuring captured speech', async () => {
    const onIntentTextChange = vi.fn()
    const onStructureIntent = vi.fn()
    class MockSpeechRecognition {
      static current: MockSpeechRecognition | undefined
      continuous = false
      interimResults = false
      lang = ''
      onstart: (() => void) | null = null
      onresult: ((event: { results: ({ transcript: string }[] & { isFinal?: boolean })[] }) => void) | null = null
      onerror: (() => void) | null = null
      onend: (() => void) | null = null

      constructor() {
        MockSpeechRecognition.current = this
      }

      start() {
        this.onstart?.()
        expect(this.interimResults).toBe(true)
      }
    }

    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition)

    render(
      <PaymentIntentIntake
        scenarios={demoScenarios}
        intentText="Original typed payment outcome."
        onIntentTextChange={onIntentTextChange}
        onStructureIntent={onStructureIntent}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /speak payment intent/i }))

    act(() => {
      MockSpeechRecognition.current?.onresult?.({ results: [Object.assign([{ transcript: 'Send GBP 5,000' }], { isFinal: false })] })
    })
    expect(screen.getByText('Live transcript')).toBeInTheDocument()
    expect(screen.getByText('Send GBP 5,000')).toBeInTheDocument()
    expect(onStructureIntent).not.toHaveBeenCalled()

    act(() => {
      MockSpeechRecognition.current?.onresult?.({ results: [Object.assign([{ transcript: 'Send GBP 5,000 to India in INR with tracking.' }], { isFinal: true })] })
      MockSpeechRecognition.current?.onend?.()
    })

    expect(screen.getByText('Captured transcript — review before structuring')).toBeInTheDocument()
    expect(screen.getByText('Send GBP 5,000 to India in INR with tracking.')).toBeInTheDocument()
    expect(screen.getByLabelText('Customer outcome')).toHaveValue('Original typed payment outcome.')
    expect(onStructureIntent).not.toHaveBeenCalled()
    expect(screen.getByText(/Transcript captured/i)).toBeInTheDocument()
    expect(screen.getByText(/voice cannot approve or execute payments/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /use this transcript/i }))

    await waitFor(() => {
      expect(onIntentTextChange).toHaveBeenCalledWith('Send GBP 5,000 to India in INR with tracking.')
    })
    expect(onStructureIntent).toHaveBeenCalledWith('Send GBP 5,000 to India in INR with tracking.')
  })

  it('lets the user retry or edit a captured transcript before structuring', () => {
    const onIntentTextChange = vi.fn()
    const transcripts = [
      'Send GBP 100 to the wrong place.',
      'Send GBP 250 to a UK bank account.',
    ]

    class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ''
      onstart: (() => void) | null = null
      onresult: ((event: { results: ({ transcript: string }[] & { isFinal?: boolean })[] }) => void) | null = null
      onerror: (() => void) | null = null
      onend: (() => void) | null = null

      start() {
        this.onstart?.()
        const transcript = transcripts.shift() ?? 'Send GBP 250 to a UK bank account.'
        this.onresult?.({ results: [Object.assign([{ transcript }], { isFinal: true })] })
        this.onend?.()
      }
    }

    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition)

    render(
      <PaymentIntentIntake
        scenarios={demoScenarios}
        intentText="Typed payment stays editable."
        onIntentTextChange={onIntentTextChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /speak payment intent/i }))
    expect(screen.getByText('Send GBP 100 to the wrong place.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.queryByText('Send GBP 100 to the wrong place.')).not.toBeInTheDocument()
    expect(screen.getByText('Send GBP 250 to a UK bank account.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /edit manually/i }))
    expect(onIntentTextChange).toHaveBeenCalledWith('Send GBP 250 to a UK bank account.')
    expect(screen.queryByText('Captured transcript — review before structuring')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Customer outcome'), {
      target: { value: 'Send GBP 300 to a UK bank account with tracking.' },
    })
    expect(onIntentTextChange).toHaveBeenCalledWith('Send GBP 300 to a UK bank account with tracking.')
  })

  it('offers transcript structuring and customer confirmation before route analysis', () => {
    const onStructureIntent = vi.fn()
    const onConfirmStructuredIntent = vi.fn()

    render(
      <PaymentIntentIntake
        scenarios={demoScenarios}
        intentText="Send GBP 5,000 to India in INR with tracking."
        onStructureIntent={onStructureIntent}
        onConfirmStructuredIntent={onConfirmStructuredIntent}
        structuredIntent={{
          rawText: 'Send GBP 5,000 to India in INR with tracking.',
          amount: 'GBP 5,000',
          currency: 'GBP',
          sourceCountry: 'United Kingdom',
          source: 'UK bank account',
          destinationCountry: 'India',
          beneficiaryType: 'Bank account',
          objective: 'FASTEST',
          trackingRequired: true,
          digitalRoutesAllowed: false,
          traditionalOnly: true,
          purpose: 'Supplier payment',
          confidence: 0.76,
          needsReview: true,
          sourceType: 'rules',
          missingFields: [],
        }}
        structuredIntentFallbackUsed
        structuredIntentWarnings={['Demo fallback structured this intent for customer review.']}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /structure intent/i }))
    expect(onStructureIntent).toHaveBeenCalled()
    expect(screen.getByText('Demo fallback structured this intent. Review before route analysis.')).toBeInTheDocument()
    expect(screen.getByText(/No payment can move from this step/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /confirm structured intent/i }))
    expect(onConfirmStructuredIntent).toHaveBeenCalled()
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
