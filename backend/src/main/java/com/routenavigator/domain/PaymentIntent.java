package com.routenavigator.domain;

import java.math.BigDecimal;
import java.util.List;

public record PaymentIntent(
        String intentId,
        String scenarioId,
        String description,
        String sourceCountry,
        String destinationCountry,
        String sourceCurrency,
        String targetCurrency,
        BigDecimal amount,
        String objective,
        boolean trackingRequired,
        boolean digitalRoutesAllowed,
        boolean traditionalOnly,
        String sourceAsset,
        String destinationEndpoint,
        List<String> constraints) {
}
