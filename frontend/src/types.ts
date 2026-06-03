export type CandidateStatus = 'SELECTED' | 'AVAILABLE' | 'EXCLUDED'

export interface PaymentIntent {
  amount: string
  source: string
  destination: string
  objective: string
  trackingRequired: boolean
  digitalRoutesAllowed: boolean
  constraints: string[]
}

export interface RouteCandidate {
  id: string
  label: string
  family: string
  status: CandidateStatus
  eta: string
  cost: string
  score?: number
  reasons: string[]
  coordinates: [number, number][]
}

export interface GateResult {
  routeLabel: string
  gate: string
  result: 'PASS' | 'EXCLUDED'
  reason: string
}

export interface DecisionTrace {
  traceId: string
  selectedRoute: RouteCandidate
  candidates: RouteCandidate[]
  gates: GateResult[]
  scoreDimensions: Record<string, number>
  pointOfNoReturn: string
  finality: string
  fallback: string
  aiBoundary: string
  explanation: string
  events: string[]
  fallbackEvent?: FallbackEvent
}

export interface FallbackEvent {
  degradedRouteId: string
  activeRouteId: string
  activeRouteLabel: string
  trigger: string
  pointOfNoReturnReached: boolean
  state: string
  message: string
}

export interface DemoScenario {
  id: string
  name: string
  intent: PaymentIntent
  trace: DecisionTrace
}
