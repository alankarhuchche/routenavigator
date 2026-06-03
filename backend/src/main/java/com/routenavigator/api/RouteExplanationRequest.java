package com.routenavigator.api;

import com.routenavigator.domain.DecisionTrace;

public record RouteExplanationRequest(String traceId, DecisionTrace decisionTrace) {
}
