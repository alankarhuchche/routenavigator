package com.routenavigator.domain;

import java.time.Instant;
import java.util.List;

public record DecisionTrace(
        String traceId,
        String scenarioId,
        Instant createdAt,
        PaymentIntent customerIntent,
        List<RouteCandidate> candidateRoutes,
        List<GateResult> gateResults,
        List<RouteCandidate> excludedRoutes,
        List<ScoreResult> scoreResults,
        RouteCandidate selectedRoute,
        List<String> alternativeReasons,
        String pointOfNoReturn,
        String finalityModel,
        RouteCandidate fallbackCandidate,
        List<EvidenceReference> evidenceReferences,
        String aiBoundary,
        List<ExecutionEvent> executionEvents,
        boolean simulated) {
}
