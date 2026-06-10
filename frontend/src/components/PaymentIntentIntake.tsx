import { Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { DemoScenario } from '../types'

interface PaymentIntentIntakeProps {
  scenarios: DemoScenario[]
  onIntentTextChange?: (text: string) => void
}

type ObjectivePreference = 'FASTEST' | 'CHEAPEST' | 'MOST_TRANSPARENT'

const examplePrompts = [
  'Send GBP 500 to a UK beneficiary as quickly as possible.',
  'Send USD 10,000 from my UK bank account to a US bank account. Fastest route, tracking required, digital routes allowed.',
  'Send 10,000 USDC from my wallet to a beneficiary wallet.',
  'Send USD 1,000 from GBP to a US bank account, cheapest route please.',
]

export function PaymentIntentIntake({ scenarios, onIntentTextChange }: PaymentIntentIntakeProps) {
  const [naturalLanguageIntent, setNaturalLanguageIntent] = useState(examplePrompts[1])

  useEffect(() => {
    onIntentTextChange?.(naturalLanguageIntent)
  }, [])
  const [objective, setObjective] = useState<ObjectivePreference>('FASTEST')
  const [trackingRequired, setTrackingRequired] = useState(true)
  const [digitalRoutesAllowed, setDigitalRoutesAllowed] = useState(true)
  const [traditionalOnly, setTraditionalOnly] = useState(false)
  const [simulateFallback, setSimulateFallback] = useState(false)
  const matchedScenario = useMemo(
    () => matchScenario(scenarios, naturalLanguageIntent, {
      objective,
      trackingRequired,
      digitalRoutesAllowed,
      traditionalOnly,
      simulateFallback,
    }),
    [digitalRoutesAllowed, naturalLanguageIntent, objective, scenarios, simulateFallback, trackingRequired, traditionalOnly],
  )

  return (
    <section className="panel intent-intake">
      <div className="panel-title">
        <Sparkles size={18} aria-hidden="true" />
        <h2>Customer Intent Intake</h2>
      </div>
      <div className="intent-form">
        <label htmlFor="natural-language-intent">
          Describe the payment — then click <strong>Analyse Route</strong> below
        </label>
        <textarea
          id="natural-language-intent"
          value={naturalLanguageIntent}
          rows={5}
          onChange={(event) => {
            setNaturalLanguageIntent(event.target.value)
            onIntentTextChange?.(event.target.value)
          }}
        />

        <div className="preference-grid" aria-label="Payment preferences">
          <label>
            Objective
            <select value={objective} onChange={(event) => setObjective(event.target.value as ObjectivePreference)}>
              <option value="FASTEST">Fastest</option>
              <option value="CHEAPEST">Cheapest</option>
              <option value="MOST_TRANSPARENT">Most transparent</option>
            </select>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={trackingRequired}
              onChange={(event) => setTrackingRequired(event.target.checked)}
            />
            Tracking required
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={digitalRoutesAllowed}
              disabled={traditionalOnly}
              onChange={(event) => setDigitalRoutesAllowed(event.target.checked)}
            />
            Digital routes allowed
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={traditionalOnly}
              onChange={(event) => {
                setTraditionalOnly(event.target.checked)
                if (event.target.checked) {
                  setDigitalRoutesAllowed(false)
                }
              }}
            />
            Traditional bank transfer only
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={simulateFallback}
              onChange={(event) => setSimulateFallback(event.target.checked)}
            />
            Simulate pre-PONR degradation
          </label>
        </div>

      </div>

      <div className="match-summary">
        <dt>Preview match (AI will confirm when you click Analyse Route)</dt>
        <dd>{matchedScenario.scenario.name}</dd>
        <p>{matchedScenario.reason}</p>
      </div>
    </section>
  )
}

function matchScenario(
  scenarios: DemoScenario[],
  text: string,
  preferences: {
    objective: ObjectivePreference
    trackingRequired: boolean
    digitalRoutesAllowed: boolean
    traditionalOnly: boolean
    simulateFallback: boolean
  },
) {
  const normalisedText = text.toLowerCase()

  if (preferences.simulateFallback || normalisedText.includes('fallback') || normalisedText.includes('degradation')) {
    return withReason(scenarios, 'SCN-006', 'Matched to fallback scenario because pre-PONR degradation was requested.')
  }

  if (
    preferences.traditionalOnly ||
    normalisedText.includes('traditional') ||
    normalisedText.includes('bank transfer only') ||
    normalisedText.includes('no digital')
  ) {
    return withReason(scenarios, 'SCN-005', 'Matched to traditional bank-transfer-only flow; digital routes are excluded.')
  }

  if (normalisedText.includes('wallet') || normalisedText.includes('usdc')) {
    return withReason(scenarios, 'SCN-003', 'Matched to wallet-to-wallet digital-dollar transfer based on asset and endpoint language.')
  }

  if (preferences.objective === 'CHEAPEST' || normalisedText.includes('cheap') || normalisedText.includes('lowest cost')) {
    return withReason(scenarios, 'SCN-004', 'Matched to cheapest GBP-to-USD bank payout preference.')
  }

  if (normalisedText.includes('uk') && !normalisedText.includes('usd') && !normalisedText.includes('dollar')) {
    return withReason(scenarios, 'SCN-001', 'Matched to domestic UK instant payment.')
  }

  if (preferences.objective === 'MOST_TRANSPARENT' && !preferences.digitalRoutesAllowed) {
    return withReason(scenarios, 'SCN-005', 'Matched to correspondent banking because transparency was preferred and digital routes were not allowed.')
  }

  return withReason(scenarios, 'SCN-002', 'Matched to fastest GBP-to-USD bank payout with tracking and digital routes allowed.')
}

function withReason(scenarios: DemoScenario[], scenarioId: string, reason: string) {
  return {
    scenario: scenarios.find((scenario) => scenario.id === scenarioId) ?? scenarios[0],
    reason,
  }
}
