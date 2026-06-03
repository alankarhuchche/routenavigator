package com.routenavigator.api;

public record IntentClassificationResponse(
        String scenarioId,
        String reason,
        String classifiedBy) {}
