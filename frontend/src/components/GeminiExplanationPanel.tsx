import { Sparkles } from 'lucide-react'
import type { DecisionTrace } from '../types'

export function GeminiExplanationPanel({ trace }: { trace: DecisionTrace }) {
  return (
    <div className="gemini-panel">
      <div>
        <Sparkles size={16} aria-hidden="true" />
        <strong>Template fallback</strong>
      </div>
      <p>{trace.explanation}</p>
    </div>
  )
}
