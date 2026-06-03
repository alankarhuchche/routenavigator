package com.routenavigator.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class DecisionTraceServiceTest {
    @Inject
    ScenarioService scenarioService;

    @Inject
    RouteDecisionService routeDecisionService;

    @Inject
    DecisionTraceService decisionTraceService;

    @Test
    void stablecoinBridgeTraceContainsFinalityFallbackAndAiBoundary() {
        var scenario = scenarioService.findById("SCN-002").orElseThrow();
        var trace = decisionTraceService.createTrace(routeDecisionService.decide(scenario.paymentIntent()));

        assertEquals("route-stablecoin-bridge-fiat-payout", trace.selectedRoute().routeId());
        assertTrue(trace.finalityModel().contains("beneficiary usable fiat value"));
        assertNotNull(trace.fallbackCandidate());
        assertTrue(trace.aiBoundary().contains("must not select"));
        assertFalse(trace.gateResults().isEmpty());
        assertFalse(trace.scoreResults().isEmpty());
    }

    @Test
    void internationalBankTransferTraceModelsCorrespondentBanking() {
        var scenario = scenarioService.findById("SCN-005").orElseThrow();
        var trace = decisionTraceService.createTrace(routeDecisionService.decide(scenario.paymentIntent()));

        assertEquals("route-correspondent-banking", trace.selectedRoute().routeId());
        assertEquals("CORRESPONDENT_BANKING", trace.selectedRoute().family());
        assertTrue(trace.pointOfNoReturn().contains("Correspondent banking"));
        assertTrue(trace.alternativeReasons().stream().anyMatch(reason -> reason.contains("excluded")));
    }
}
