package com.routenavigator.domain;

import java.util.List;

public record RouteDecisionResult(
        PaymentIntent paymentIntent,
        List<RouteCandidate> candidateRoutes,
        List<RouteCandidate> excludedRoutes,
        List<GateResult> gateResults,
        List<ScoreResult> scoreResults,
        RouteCandidate selectedRoute,
        RouteCandidate fallbackCandidate) {
}
