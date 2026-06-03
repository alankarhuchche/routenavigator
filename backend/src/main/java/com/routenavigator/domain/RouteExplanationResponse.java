package com.routenavigator.domain;

public record RouteExplanationResponse(
        String provider,
        boolean geminiEnabled,
        String explanation,
        DecisionTrace redactedTrace) {
}
