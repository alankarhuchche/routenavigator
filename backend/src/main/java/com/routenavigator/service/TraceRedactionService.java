package com.routenavigator.service;

import com.routenavigator.domain.DecisionTrace;
import com.routenavigator.domain.PaymentIntent;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class TraceRedactionService {
    public DecisionTrace redact(DecisionTrace trace) {
        return new DecisionTrace(
                trace.traceId(),
                trace.scenarioId(),
                trace.createdAt(),
                redactIntent(trace.customerIntent()),
                trace.candidateRoutes(),
                trace.gateResults(),
                trace.excludedRoutes(),
                trace.scoreResults(),
                trace.selectedRoute(),
                trace.alternativeReasons(),
                trace.pointOfNoReturn(),
                trace.finalityModel(),
                trace.fallbackCandidate(),
                trace.evidenceReferences(),
                trace.aiBoundary(),
                trace.executionEvents(),
                trace.simulated()
        );
    }

    private PaymentIntent redactIntent(PaymentIntent intent) {
        return new PaymentIntent(
                intent.intentId(),
                intent.scenarioId(),
                "REDACTED",
                intent.sourceCountry(),
                intent.destinationCountry(),
                intent.sourceCurrency(),
                intent.targetCurrency(),
                intent.amount(),
                intent.objective(),
                intent.trackingRequired(),
                intent.digitalRoutesAllowed(),
                intent.traditionalOnly(),
                mask(intent.sourceAsset()),
                mask(intent.destinationEndpoint()),
                List.of("REDACTED_CONSTRAINTS")
        );
    }

    private String mask(String value) {
        return value == null || value.isBlank() ? "REDACTED" : "REDACTED";
    }
}
