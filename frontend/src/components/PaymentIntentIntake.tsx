import { Mic, Sparkles } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_PAYMENT_INTENT_TEXT } from '../defaultIntent'
import type { ApiStructuredIntent } from '../apiTypes'
import type { DemoScenario } from '../types'
import { IntentConfirmationCard } from './IntentConfirmationCard'

export interface LivePreferences {
  objective: ObjectivePreference
  trackingRequired: boolean
  digitalRoutesAllowed: boolean
}

interface PaymentIntentIntakeProps {
  scenarios: DemoScenario[]
  intentText?: string
  onIntentTextChange?: (text: string) => void
  onPreferencesChange?: (prefs: LivePreferences) => void
  onScenarioMatch?: (scenarioId: string) => void
  onStructureIntent?: () => void
  onConfirmStructuredIntent?: () => void
  structuredIntent?: ApiStructuredIntent
  structuredIntentFallbackUsed?: boolean
  structuredIntentWarnings?: string[]
  structureError?: string | null
  isStructuring?: boolean
  structuredIntentConfirmed?: boolean
}

type ObjectivePreference = 'FASTEST' | 'CHEAPEST' | 'MOST_TRANSPARENT'
type VoiceStatus = 'idle' | 'listening' | 'captured' | 'unsupported' | 'error'

interface SpeechRecognitionResultLike {
  transcript: string
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

export function PaymentIntentIntake({
  scenarios,
  intentText,
  onIntentTextChange,
  onPreferencesChange,
  onScenarioMatch,
  onStructureIntent,
  onConfirmStructuredIntent,
  structuredIntent,
  structuredIntentFallbackUsed,
  structuredIntentWarnings,
  structureError,
  isStructuring,
  structuredIntentConfirmed,
}: PaymentIntentIntakeProps) {
  const [internalIntent, setInternalIntent] = useState(DEFAULT_PAYMENT_INTENT_TEXT)
  const [objective, setObjective] = useState<ObjectivePreference>('FASTEST')
  const [trackingRequired, setTrackingRequired] = useState(true)
  const [digitalRoutesAllowed, setDigitalRoutesAllowed] = useState(true)
  const [traditionalOnly, setTraditionalOnly] = useState(false)
  const [simulateFallback, setSimulateFallback] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(() => getSpeechRecognitionConstructor() ? 'idle' : 'unsupported')
  const [voiceMessage, setVoiceMessage] = useState(() => getSpeechRecognitionConstructor()
    ? 'Voice captures intent only. Passkey approval is still required before anything moves.'
    : 'Speech recognition not supported — type the intent instead.')
  const naturalLanguageIntent = intentText ?? internalIntent

  function updateIntentText(text: string) {
    if (intentText === undefined) {
      setInternalIntent(text)
    }
    onIntentTextChange?.(text)
  }

  useEffect(() => {
    onIntentTextChange?.(naturalLanguageIntent)
    onPreferencesChange?.({ objective, trackingRequired, digitalRoutesAllowed })
  }, [digitalRoutesAllowed, naturalLanguageIntent, objective, onIntentTextChange, onPreferencesChange, trackingRequired])
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

  useEffect(() => {
    onScenarioMatch?.(matchedScenario.scenario.id)
  }, [matchedScenario.scenario.id, onScenarioMatch])

  return (
    <section className="panel intent-intake secure-intent-composer">
      <div className="intent-hero">
        <div className="intent-hero-icon">
          <Sparkles size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">Intent Capture</p>
          <h2>What outcome do you need from this payment?</h2>
          <p>
            Speak or type the payment outcome. The bank-owned route engine will analyse safe routes after you confirm.
          </p>
        </div>
      </div>
      <div className="intent-form">
        <div className="intent-principle">
          <strong>Conversational in. Deterministic out.</strong>
          <span>GenAI structures and explains the intent. The bank-owned route engine decides the route.</span>
        </div>
        <span className="suggested-intent-label">Suggested demo intent — review and edit before analysis</span>
        <label htmlFor="natural-language-intent">Customer outcome</label>
        <div className="outcome-input-row">
          <textarea
            id="natural-language-intent"
            value={naturalLanguageIntent}
            rows={7}
            placeholder="Example: Send GBP 5,000 to a supplier in India in INR today, with tracking and strong certainty."
            onChange={(event) => {
              updateIntentText(event.target.value)
            }}
          />
          <button
            type="button"
            className="mic-button"
            disabled={voiceStatus === 'unsupported' || voiceStatus === 'listening'}
            title={voiceStatus === 'unsupported' ? 'Speech recognition is not supported in this browser' : 'Speak payment intent for demo capture'}
            aria-label="Speak payment intent"
            onClick={() => startVoiceCapture({
              currentText: naturalLanguageIntent,
              setText: updateIntentText,
              setVoiceStatus,
              setVoiceMessage,
            })}
          >
            <Mic size={17} aria-hidden="true" />
            <span>{voiceStatus === 'listening' ? 'Listening' : 'Speak payment intent'}</span>
          </button>
        </div>
        <p className={`voice-mock-note voice-status-${voiceStatus}`}>{voiceMessage}</p>
        <p className="intent-helper-text">
          {naturalLanguageIntent.trim().length} characters captured. Review and edit before analysis.
        </p>

        <div className="intent-structure-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={onStructureIntent}
            disabled={isStructuring || !naturalLanguageIntent.trim()}
          >
            {isStructuring ? 'Structuring intent...' : 'Structure intent'}
          </button>
          <span>
            Transcript text is sent to the backend for a draft structured intent. No raw audio is uploaded.
          </span>
        </div>
        {structureError && <p className="intent-structure-error">{structureError}</p>}

        <div className="preference-grid" aria-label="Payment preferences">
          <label className="preference-card preference-select-card">
            <span>Objective</span>
            <select value={objective} onChange={(event) => {
              const v = event.target.value as ObjectivePreference
              setObjective(v)
              onPreferencesChange?.({ objective: v, trackingRequired, digitalRoutesAllowed })
            }}>
              <option value="FASTEST">Fastest</option>
              <option value="CHEAPEST">Cheapest</option>
              <option value="MOST_TRANSPARENT">Most transparent</option>
            </select>
          </label>
          <label className="check-row preference-card">
            <input
              type="checkbox"
              checked={trackingRequired}
              onChange={(event) => {
                setTrackingRequired(event.target.checked)
                onPreferencesChange?.({ objective, trackingRequired: event.target.checked, digitalRoutesAllowed })
              }}
            />
            <span>Tracking required</span>
          </label>
          <label className="check-row preference-card">
            <input
              type="checkbox"
              checked={digitalRoutesAllowed}
              disabled={traditionalOnly}
              onChange={(event) => {
                setDigitalRoutesAllowed(event.target.checked)
                onPreferencesChange?.({ objective, trackingRequired, digitalRoutesAllowed: event.target.checked })
              }}
            />
            <span>Digital routes allowed</span>
          </label>
          <label className="check-row preference-card">
            <input
              type="checkbox"
              checked={traditionalOnly}
              onChange={(event) => {
                setTraditionalOnly(event.target.checked)
                if (event.target.checked) {
                  setDigitalRoutesAllowed(false)
                  onPreferencesChange?.({ objective, trackingRequired, digitalRoutesAllowed: false })
                } else {
                  onPreferencesChange?.({ objective, trackingRequired, digitalRoutesAllowed })
                }
              }}
            />
            <span>Traditional bank transfer only</span>
          </label>
          <label className="check-row preference-card">
            <input
              type="checkbox"
              checked={simulateFallback}
              onChange={(event) => setSimulateFallback(event.target.checked)}
            />
            <span>Simulate a mid-payment failure</span>
          </label>
        </div>

        <div className="intent-safety-boundary">
          Voice captures intent only. Passkey approval is required before anything moves.
        </div>

      </div>

      <div className="match-summary">
        <dt>Structured intent preview</dt>
        <dd>{matchedScenario.scenario.name}</dd>
        <p>{matchedScenario.reason}</p>
        {matchedScenario.scenario.executionMode === 'STATIC_DEMO' && (
          <p className="static-demo-note">
            {matchedScenario.scenario.executionLabel ?? 'Illustrative corridor demo'} — {matchedScenario.scenario.executionNote ?? 'Static frontend scenario; backend corridor route support is deferred.'}
          </p>
        )}
      </div>
      {structuredIntent || onConfirmStructuredIntent ? (
        <IntentConfirmationCard
          intent={matchedScenario.scenario.intent}
          structuredIntent={structuredIntent}
          fallbackUsed={structuredIntentFallbackUsed}
          warnings={structuredIntentWarnings}
          confirmed={structuredIntentConfirmed}
          onConfirm={structuredIntent ? onConfirmStructuredIntent : undefined}
        />
      ) : (
        <IntentConfirmationCard intent={matchedScenario.scenario.intent} />
      )}
    </section>
  )
}

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return undefined
  const speechWindow = window as SpeechRecognitionWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

function startVoiceCapture({
  currentText,
  setText,
  setVoiceStatus,
  setVoiceMessage,
}: {
  currentText: string
  setText: (text: string) => void
  setVoiceStatus: Dispatch<SetStateAction<VoiceStatus>>
  setVoiceMessage: (message: string) => void
}) {
  const SpeechRecognitionCtor = getSpeechRecognitionConstructor()
  if (!SpeechRecognitionCtor) {
    setVoiceStatus('unsupported')
    setVoiceMessage('Speech recognition not supported — type the intent instead.')
    return
  }

  const recognition = new SpeechRecognitionCtor()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-GB'
  recognition.onstart = () => {
    setVoiceStatus('listening')
    setVoiceMessage('Listening… Speech only fills this transcript field; passkey approval is still required.')
  }
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0]?.transcript ?? '')
      .join(' ')
      .trim()
    if (transcript) {
      const nextText = currentText.trim()
        ? `${currentText.trim()} ${transcript}`
        : transcript
      setText(nextText)
      setVoiceStatus('captured')
      setVoiceMessage('Transcript captured — review before structuring. Voice cannot approve or execute payments.')
    }
  }
  recognition.onerror = () => {
    setVoiceStatus('error')
    setVoiceMessage('Voice capture failed. Type or edit the payment intent manually; passkey approval remains required.')
  }
  recognition.onend = () => {
    setVoiceStatus((current) => current === 'listening' ? 'idle' : current)
  }
  recognition.start()
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
    normalisedText.includes('india') ||
    normalisedText.includes('mumbai') ||
    normalisedText.includes('delhi') ||
    normalisedText.includes('inr') ||
    normalisedText.includes('rupee')
  ) {
    return withReason(scenarios, 'SCN-007', 'Matched to India corridor — SWIFT correspondent banking required under RBI FEMA regulations; digital routes not permitted for this corridor.')
  }

  if (
    normalisedText.includes('china') ||
    normalisedText.includes('beijing') ||
    normalisedText.includes('shanghai') ||
    normalisedText.includes('cny') ||
    normalisedText.includes('renminbi') ||
    normalisedText.includes('yuan')
  ) {
    return withReason(scenarios, 'SCN-008', 'Matched to China corridor — SWIFT correspondent banking required under PBOC capital control regulations; digital routes not permitted for this corridor.')
  }

  if (
    normalisedText.includes('uae') ||
    normalisedText.includes('dubai') ||
    normalisedText.includes('abu dhabi') ||
    normalisedText.includes('aed') ||
    normalisedText.includes('dirham') ||
    normalisedText.includes('emirates')
  ) {
    return withReason(scenarios, 'SCN-011', 'Matched to UAE corridor — SWIFT correspondent banking selected; CBUAE regulations restrict digital routes above GBP 10,000.')
  }

  if (
    normalisedText.includes('australia') ||
    normalisedText.includes('sydney') ||
    normalisedText.includes('melbourne') ||
    normalisedText.includes('aud') ||
    normalisedText.includes('australian dollar')
  ) {
    return withReason(scenarios, 'SCN-010', 'Matched to Australia corridor — NPP local payout is fastest; SWIFT available as fallback.')
  }

  if (
    normalisedText.includes('euro') ||
    normalisedText.includes(' eur ') ||
    normalisedText.includes('sepa') ||
    normalisedText.includes('europe') ||
    normalisedText.includes('germany') ||
    normalisedText.includes('france') ||
    normalisedText.includes('spain') ||
    normalisedText.includes('italy') ||
    normalisedText.includes('netherlands') ||
    normalisedText.includes('amsterdam') ||
    normalisedText.includes('paris') ||
    normalisedText.includes('berlin') ||
    normalisedText.includes('madrid')
  ) {
    return withReason(scenarios, 'SCN-009', 'Matched to EU corridor — SEPA credit transfer via correspondent is fastest and cheapest post-Brexit route.')
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
