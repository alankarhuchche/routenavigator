import { Sparkles } from 'lucide-react'
import type { DecisionTrace } from '../types'

interface Props {
  trace: DecisionTrace
  provider?: string
  isLoading?: boolean
}

export function GeminiExplanationPanel({ trace, provider, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="gemini-panel gemini-panel-loading">
        <div>
          <Sparkles size={16} aria-hidden="true" />
          <strong className="gemini-badge-analysing">Analysing with Gemini...</strong>
        </div>
        <p className="gemini-loading-text" aria-busy="true">Requesting AI explanation...</p>
      </div>
    )
  }

  let badgeLabel: string
  let badgeClass: string

  if (provider === 'GEMINI') {
    badgeLabel = 'Gemini'
    badgeClass = 'gemini-badge-live'
  } else if (
    provider === 'GEMINI_FALLBACK' ||
    provider === 'TEMPLATE_FALLBACK_GEMINI_ENABLED'
  ) {
    badgeLabel = 'Template fallback'
    badgeClass = 'gemini-badge-amber'
  } else {
    badgeLabel = 'Template fallback'
    badgeClass = 'gemini-badge-grey'
  }

  return (
    <div className="gemini-panel">
      <div>
        <Sparkles size={16} aria-hidden="true" />
        <strong className={badgeClass}>{badgeLabel}</strong>
      </div>
      <p>{trace.explanation}</p>
    </div>
  )
}
