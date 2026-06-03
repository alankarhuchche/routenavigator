export interface ApiRouteCandidate {
  routeId: string
  customerLabel: string
  family: string
  status: string
  reasons: string[]
}

export interface ApiGateResult {
  routeId: string
  gateId: string
  gateType: string
  passed: boolean
  blocking: boolean
  reasonCode: string
  message: string
}

export interface ApiExecutionEvent {
  eventId: string
  traceId: string
  routeId: string
  state: string
  message: string
  occurredAt: string
  pointOfNoReturnReached: boolean
}

export interface ApiDecisionTrace {
  traceId: string
  scenarioId: string
  customerIntent: {
    amount?: string
    source?: string
    destination?: string
    objective: string
    trackingRequired: boolean
    digitalRoutesAllowed: boolean
    constraints: string[]
  }
  candidateRoutes: ApiRouteCandidate[]
  gateResults: ApiGateResult[]
  excludedRoutes: ApiRouteCandidate[]
  selectedRoute: ApiRouteCandidate
  pointOfNoReturn: string
  finalityModel: string
  fallbackCandidate: ApiRouteCandidate | null
  aiBoundary: string
  executionEvents: ApiExecutionEvent[]
}

export interface ApiExplanationResponse {
  provider: string
  geminiEnabled: boolean
  explanation: string
  redactedTrace: ApiDecisionTrace
}

export interface ApiPaymentSnapshot {
  traceId: string
  state: string
  activeRouteId: string
  pointOfNoReturnReached: boolean
  fallbackApplied: boolean
  events: ApiExecutionEvent[]
}
