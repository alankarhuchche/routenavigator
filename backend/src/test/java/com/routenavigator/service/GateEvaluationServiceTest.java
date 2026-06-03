package com.routenavigator.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class GateEvaluationServiceTest {
    @Inject
    ScenarioService scenarioService;

    @Inject
    RouteCatalogueService routeCatalogueService;

    @Inject
    GateEvaluationService gateEvaluationService;

    @Test
    void traditionalBankTransferOnlyExcludesDigitalRoutesBeforeScoring() {
        var scenario = scenarioService.findById("SCN-005").orElseThrow();
        var outcome = gateEvaluationService.evaluate(scenario.paymentIntent(), routeCatalogueService.findAll());

        assertEquals(Set.of("route-correspondent-banking"), routeIds(outcome.survivingRoutes()));
        assertTrue(routeIds(outcome.excludedRoutes()).contains("route-stablecoin-bridge-fiat-payout"));
        assertTrue(routeIds(outcome.excludedRoutes()).contains("route-wallet-to-wallet-stablecoin"));
        assertFalse(routeIds(outcome.survivingRoutes()).contains("route-stablecoin-bridge-fiat-payout"));
    }

    @Test
    void walletToWalletIntentKeepsOnlyWalletTransferAvailable() {
        var scenario = scenarioService.findById("SCN-003").orElseThrow();
        var outcome = gateEvaluationService.evaluate(scenario.paymentIntent(), routeCatalogueService.findAll());

        assertEquals(Set.of("route-wallet-to-wallet-stablecoin"), routeIds(outcome.survivingRoutes()));
    }

    @Test
    void scoringBoundaryContainsOnlyAvailableRoutes() {
        var scenario = scenarioService.findById("SCN-002").orElseThrow();
        var outcome = gateEvaluationService.evaluate(scenario.paymentIntent(), routeCatalogueService.findAll());

        assertTrue(outcome.survivingRoutes().stream()
                .allMatch(candidate -> GateEvaluationService.AVAILABLE.equals(candidate.status())));
        assertTrue(outcome.excludedRoutes().stream()
                .allMatch(candidate -> GateEvaluationService.EXCLUDED.equals(candidate.status())));
        assertTrue(routeIds(outcome.survivingRoutes()).stream()
                .noneMatch(routeIds(outcome.excludedRoutes())::contains));
    }

    private Set<String> routeIds(java.util.List<com.routenavigator.domain.RouteCandidate> candidates) {
        return candidates.stream().map(com.routenavigator.domain.RouteCandidate::routeId).collect(Collectors.toSet());
    }
}
