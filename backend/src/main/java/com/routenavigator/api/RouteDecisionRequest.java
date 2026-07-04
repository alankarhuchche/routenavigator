package com.routenavigator.api;

import com.routenavigator.domain.CustomerInsightContext;
import com.routenavigator.domain.PaymentIntent;

public record RouteDecisionRequest(
        String scenarioId,
        PaymentIntent paymentIntent,
        Boolean customerInsightUsed,
        CustomerInsightContext customerInsightContext) {
}
