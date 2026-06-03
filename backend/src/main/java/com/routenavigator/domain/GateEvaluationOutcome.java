package com.routenavigator.domain;

import java.util.List;

public record GateEvaluationOutcome(
        PaymentIntent paymentIntent,
        List<RouteCandidate> candidateRoutes,
        List<RouteCandidate> survivingRoutes,
        List<RouteCandidate> excludedRoutes,
        List<GateResult> gateResults) {
}
