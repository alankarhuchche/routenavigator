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
        List<ScoreResult> scoreResults,
        RouteCandidate selectedRoute,
        RouteCandidate fallbackCandidate,
        List<EvidenceReference> evidenceReferences,
        List<ExecutionEvent> executionEvents,
        boolean simulated) {
}
