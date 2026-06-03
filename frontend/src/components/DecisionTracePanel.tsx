import { BrainCircuit, FileJson, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { DecisionTrace } from '../types'
import { GeminiExplanationPanel } from './GeminiExplanationPanel'
import { GateResultTable } from './GateResultTable'
import { ScoreBreakdown } from './ScoreBreakdown'

type TraceTab = 'customer' | 'executive' | 'technical'

interface Props {
  trace: DecisionTrace
  provider?: string
  isLoading?: boolean
}

export function DecisionTracePanel({ trace, provider, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<TraceTab>('customer')

  return (
    <section className="panel trace-panel">
      <div className="panel-title">
        <FileJson size={18} aria-hidden="true" />
        <h2>Decision Trace</h2>
      </div>
      <div className="tab-list" role="tablist" aria-label="Decision Trace views">
        <button type="button" className={activeTab === 'customer' ? 'active' : ''} onClick={() => setActiveTab('customer')}>
          <BrainCircuit size={16} aria-hidden="true" />
          Customer
        </button>
        <button type="button" className={activeTab === 'executive' ? 'active' : ''} onClick={() => setActiveTab('executive')}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          Executive
        </button>
        <button type="button" className={activeTab === 'technical' ? 'active' : ''} onClick={() => setActiveTab('technical')}>
          <FileJson size={16} aria-hidden="true" />
          Technical
        </button>
      </div>

      {activeTab === 'customer' && (
        <div className="trace-section">
          <GeminiExplanationPanel trace={trace} provider={provider} isLoading={isLoading} />
          <dl className="trace-facts">
            <div>
              <dt>Selected</dt>
              <dd>{trace.selectedRoute.label}</dd>
            </div>
            <div>
              <dt>Finality</dt>
              <dd>{trace.finality}</dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'executive' && (
        <div className="trace-section">
          <ScoreBreakdown dimensions={trace.scoreDimensions} />
          <dl className="trace-facts">
            <div>
              <dt>PONR</dt>
              <dd>{trace.pointOfNoReturn}</dd>
            </div>
            <div>
              <dt>Fallback</dt>
              <dd>{trace.fallback}</dd>
            </div>
          </dl>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="trace-section">
          <code className="trace-id">{trace.traceId}</code>
          <GateResultTable gates={trace.gates} />
          <p className="ai-boundary">{trace.aiBoundary}</p>
        </div>
      )}
    </section>
  )
}
