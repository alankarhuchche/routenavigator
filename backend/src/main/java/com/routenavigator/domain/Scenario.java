package com.routenavigator.domain;

import java.util.List;

public record Scenario(
        String scenarioId,
        String name,
        PaymentIntent paymentIntent,
        String expectedWinnerRouteId,
        String expectedFamily,
        List<String> notes,
        boolean simulated) {
}
