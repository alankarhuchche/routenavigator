import { Bot, PauseCircle, ShieldCheck, Sparkles, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { DecisionTrace } from '../types'

interface TrustedAgentExplanationPanelProps {
  trace: DecisionTrace
  provider?: string
  isLoading?: boolean
}

export function TrustedAgentExplanationPanel({ trace, provider, isLoading }: TrustedAgentExplanationPanelProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
  const source = explanationSource(provider)
  const explanation = useMemo(() => {
    if (trace.explanation?.trim()) return trace.explanation
    return 'Demo fallback explanation: the deterministic route engine recommended this route after controls and scoring were applied. Review the Decision Trace for alternatives and gate results.'
  }, [trace.explanation])

  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis?.cancel()
    }
  }, [speechSupported])

  function handleReadAloud() {
    if (!speechSupported) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(explanation)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <section className="trusted-agent-explanation" aria-label="Trusted banking agent explanation">
      <div className="trusted-agent-explanation-head">
        <div className="trusted-agent-avatar" aria-hidden="true">
          <Bot size={20} />
        </div>
        <div>
          <p className="eyebrow">Trusted banking agent</p>
          <h2>{isLoading ? 'Explaining route recommendation' : 'Route recommendation explained'}</h2>
          <p>
            The agent explains the route recommendation. The deterministic route engine decides. You approve with passkey before anything moves.
          </p>
        </div>
        <span className={`trusted-agent-source ${source.tone}`}>
          <Sparkles size={14} aria-hidden="true" />
          {source.label}
        </span>
      </div>

      <div className="trusted-agent-explanation-body">
        <p>{isLoading ? 'Preparing explanation from redacted route evidence...' : explanation}</p>
      </div>

      <div className="trusted-agent-boundary">
        <ShieldCheck size={15} aria-hidden="true" />
        <span>Agent boundary: explain and summarise only. The agent cannot approve, execute, amend, cancel or move money.</span>
      </div>

      <div className="trusted-agent-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={handleReadAloud}
          disabled={!speechSupported || isLoading}
        >
          {isSpeaking ? <PauseCircle size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
          {isSpeaking ? 'Stop read-aloud' : 'Read explanation aloud'}
        </button>
        {!speechSupported && <span>Browser read-aloud is unavailable. Read the explanation on screen.</span>}
        {speechSupported && <span>Read-aloud uses browser text-to-speech only; it does not capture voice or approve payment.</span>}
      </div>
    </section>
  )
}

function explanationSource(provider?: string) {
  if (provider === 'GEMINI') {
    return { label: 'Gemini explanation', tone: 'live' }
  }
  if (provider === 'GEMINI_FALLBACK' || provider === 'TEMPLATE_FALLBACK_GEMINI_ENABLED') {
    return { label: 'Template explanation', tone: 'fallback' }
  }
  return { label: 'Demo fallback explanation', tone: 'fallback' }
}
