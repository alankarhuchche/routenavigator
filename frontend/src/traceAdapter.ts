import type { DecisionTrace, RouteCandidate, GateResult } from './types'
import type { ApiDecisionTrace, ApiRouteCandidate } from './apiTypes'
import type { DemoScenario } from './types'

const DEFAULT_EVENTS = [
  'Payment intent confirmed',
  'Blocking gates evaluated',
  'Route selected',
  'Awaiting simulated authorisation',
]

function adaptRouteCandidate(
  api: ApiRouteCandidate,
  staticCandidates: RouteCandidate[],
): RouteCandidate {
  const match = staticCandidates.find((c) => c.family === api.family)
  return {
    id: api.routeId,
    label: api.customerLabel,
    family: api.family,
    status: api.status as RouteCandidate['status'],
    eta: match?.eta ?? '-',
    cost: match?.cost ?? '-',
    score: match?.score,
    reasons: api.reasons,
    coordinates: match?.coordinates ?? [],
  }
}

export function adaptTrace(
  api: ApiDecisionTrace,
  scenario: DemoScenario,
  explanation: string,
): DecisionTrace {
  const staticCandidates = scenario.trace.candidates

  const seen = new Set<string>()
  const allApiRoutes = [...api.candidateRoutes, ...api.excludedRoutes].filter((r) => {
    if (seen.has(r.routeId)) return false
    seen.add(r.routeId)
    return true
  })

  const candidates: RouteCandidate[] = allApiRoutes.map((r) =>
    adaptRouteCandidate(r, staticCandidates),
  )

  const selectedRoute = adaptRouteCandidate(api.selectedRoute, staticCandidates)

  // Build a lookup for routeLabel from routeId
  const routeLabelById = new Map<string, string>(
    allApiRoutes.map((r) => [r.routeId, r.customerLabel]),
  )

  const gates: GateResult[] = api.gateResults.map((g) => ({
    routeLabel: routeLabelById.get(g.routeId) ?? g.routeId,
    gate: g.gateId,
    result: g.passed ? 'PASS' : 'EXCLUDED',
    reason: g.message,
  }))

  const events =
    api.executionEvents.length > 0
      ? api.executionEvents.map((e) => e.message)
      : DEFAULT_EVENTS

  return {
    traceId: api.traceId,
    selectedRoute,
    candidates,
    gates,
    scoreDimensions: {},
    pointOfNoReturn: api.pointOfNoReturn,
    finality: api.finalityModel,
    fallback: api.fallbackCandidate?.customerLabel ?? 'No fallback candidate',
    aiBoundary: api.aiBoundary,
    explanation,
    events,
    fallbackEvent: undefined,
  }
}
