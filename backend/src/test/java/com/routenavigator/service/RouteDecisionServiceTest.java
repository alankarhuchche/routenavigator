package com.routenavigator.service;

import com.routenavigator.domain.RouteCandidate;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class RouteDecisionServiceTest {
    @Inject
    ScenarioService scenarioService;

    @Inject
    RouteDecisionService routeDecisionService;

    @Inject
    RouteScoringService routeScoringService;

    @Test
    void selectsExpectedRouteForEachDemoScenario() {
        Map<String, String> selectedRoutes = scenarioService.findAll().stream()
                .collect(Collectors.toMap(
                        scenario -> scenario.scenarioId(),
                        scenario -> routeDecisionService.decide(scenario.paymentIntent()).selectedRoute().routeId()
                ));

        assertEquals("route-uk-instant-bank-transfer", selectedRoutes.get("SCN-001"));
        assertEquals("route-stablecoin-bridge-fiat-payout", selectedRoutes.get("SCN-002"));
        assertEquals("route-wallet-to-wallet-stablecoin", selectedRoutes.get("SCN-003"));
        assertEquals("route-local-payout-partner", selectedRoutes.get("SCN-004"));
        assertEquals("route-correspondent-banking", selectedRoutes.get("SCN-005"));
        assertEquals("route-stablecoin-bridge-fiat-payout", selectedRoutes.get("SCN-006"));
    }

    @Test
    void scoringServiceRejectsExcludedRoutes() {
        var scenario = scenarioService.findById("SCN-002").orElseThrow();
        var excluded = new RouteCandidate(
                "route-excluded",
                "Excluded route",
                "CORRESPONDENT_BANKING",
                GateEvaluationService.EXCLUDED,
                List.of("Failed hard gate")
        );

        assertThrows(IllegalArgumentException.class, () -> routeScoringService.score(scenario.paymentIntent(), List.of(excluded)));
    }

    @Test
    void routeDecisionDoesNotScoreExcludedCandidates() {
        var scenario = scenarioService.findById("SCN-005").orElseThrow();
        var decision = routeDecisionService.decide(scenario.paymentIntent());
        var scoredRouteIds = decision.scoreResults().stream().map(com.routenavigator.domain.ScoreResult::routeId).collect(Collectors.toSet());

        assertTrue(decision.excludedRoutes().stream().noneMatch(candidate -> scoredRouteIds.contains(candidate.routeId())));
        assertEquals("route-correspondent-banking", decision.selectedRoute().routeId());
    }
}
