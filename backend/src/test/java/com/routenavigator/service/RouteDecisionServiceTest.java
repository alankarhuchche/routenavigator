package com.routenavigator.service;

import com.routenavigator.domain.CustomerInsightContext;
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

    @Test
    void noInsightKeepsAdjustmentAtZeroAndFinalScoreEqualToBaseScore() {
        var scenario = scenarioService.findById("SCN-002").orElseThrow();

        var decision = routeDecisionService.decide(scenario.paymentIntent());
        var unconsentedDecision = routeDecisionService.decide(
                scenario.paymentIntent(),
                true,
                unconsentedInsight());

        assertTrue(decision.scoreResults().stream().allMatch(score -> !score.insightUsed()));
        assertTrue(decision.scoreResults().stream().allMatch(score -> score.customerFitAdjustment().signum() == 0));
        assertTrue(decision.scoreResults().stream().allMatch(score -> score.baseScore().compareTo(score.finalScore()) == 0));
        assertTrue(unconsentedDecision.scoreResults().stream().allMatch(score -> !score.insightUsed()));
        assertTrue(unconsentedDecision.scoreResults().stream().allMatch(score -> score.customerFitAdjustment().signum() == 0));
    }

    @Test
    void customerFitIsCappedAndOnlyScoresAvailableRoutes() {
        var scenario = scenarioService.findById("SCN-003").orElseThrow();
        var availableDigitalRoute = new RouteCandidate(
                "route-wallet-to-wallet-stablecoin",
                "Wallet-to-wallet digital transfer",
                "WALLET_TO_WALLET_STABLECOIN",
                GateEvaluationService.AVAILABLE,
                List.of("Passed all blocking hard gates."));

        var score = routeScoringService.score(
                scenario.paymentIntent(),
                List.of(availableDigitalRoute),
                true,
                consentedInsight()).getFirst();

        assertTrue(score.insightUsed());
        assertEquals(0, score.customerFitAdjustment().compareTo(java.math.BigDecimal.TEN));
        assertTrue(score.customerFitCapApplied());
        assertEquals(0, score.finalScore().compareTo(score.totalScore()));
        assertThrows(IllegalArgumentException.class, () -> routeScoringService.score(
                scenario.paymentIntent(),
                List.of(new RouteCandidate(
                        "route-excluded",
                        "Excluded route",
                        "WALLET_TO_WALLET_STABLECOIN",
                        GateEvaluationService.EXCLUDED,
                        List.of("Failed hard gate"))),
                true,
                consentedInsight()));
    }

    @Test
    void customerFitCannotRescueExcludedRoutesAndSelectionUsesFinalScore() {
        var scenario = scenarioService.findById("SCN-005").orElseThrow();

        var decision = routeDecisionService.decide(scenario.paymentIntent(), true, consentedInsight());
        var scoredRouteIds = decision.scoreResults().stream()
                .map(com.routenavigator.domain.ScoreResult::routeId)
                .collect(Collectors.toSet());
        var highestFinalScoreRoute = decision.scoreResults().stream()
                .max(java.util.Comparator.comparing(com.routenavigator.domain.ScoreResult::finalScore)
                        .thenComparing(com.routenavigator.domain.ScoreResult::routeId))
                .orElseThrow();

        assertTrue(decision.excludedRoutes().stream().noneMatch(candidate -> scoredRouteIds.contains(candidate.routeId())));
        assertEquals(highestFinalScoreRoute.routeId(), decision.selectedRoute().routeId());
        assertTrue(decision.scoreResults().stream().allMatch(score -> score.insightUsed()));
    }

    private CustomerInsightContext consentedInsight() {
        return new CustomerInsightContext(
                "Family support",
                "Regular UK to India support movement",
                "GBP 1,000-7,000",
                "Previously paid beneficiary",
                "High",
                "High",
                "High",
                "No route-specific previous delay",
                "Amount and beneficiary are within normal pattern",
                "Customer has allowed digital route options",
                true,
                "Demo customer profile");
    }

    private CustomerInsightContext unconsentedInsight() {
        var insight = consentedInsight();
        return new CustomerInsightContext(
                insight.purposeDetected(),
                insight.usualMovementPattern(),
                insight.typicalAmountRange(),
                insight.beneficiaryRelationship(),
                insight.trackingPreference(),
                insight.speedPreference(),
                insight.feeSensitivity(),
                insight.previousRouteExperience(),
                insight.riskNormality(),
                insight.digitalRoutesAllowed(),
                false,
                insight.insightSource());
    }
}
