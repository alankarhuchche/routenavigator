package com.routenavigator.service;

import com.routenavigator.domain.PaymentIntent;
import com.routenavigator.domain.RouteCandidate;
import com.routenavigator.domain.RouteDecisionResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Comparator;

@ApplicationScoped
public class RouteDecisionService {
    private final RouteCatalogueService routeCatalogueService;
    private final GateEvaluationService gateEvaluationService;
    private final RouteScoringService routeScoringService;

    @Inject
    public RouteDecisionService(
            RouteCatalogueService routeCatalogueService,
            GateEvaluationService gateEvaluationService,
            RouteScoringService routeScoringService) {
        this.routeCatalogueService = routeCatalogueService;
        this.gateEvaluationService = gateEvaluationService;
        this.routeScoringService = routeScoringService;
    }

    public RouteDecisionResult decide(PaymentIntent intent) {
        var gateOutcome = gateEvaluationService.evaluate(intent, routeCatalogueService.findAll());
        var scoreResults = routeScoringService.score(intent, gateOutcome.survivingRoutes());
        var selectedRouteId = scoreResults.stream()
                .max(Comparator.comparing(com.routenavigator.domain.ScoreResult::totalScore)
                        .thenComparing(com.routenavigator.domain.ScoreResult::routeId))
                .orElseThrow(() -> new IllegalStateException("No executable route found for intent " + intent.intentId()))
                .routeId();
        var selectedRoute = gateOutcome.survivingRoutes().stream()
                .filter(candidate -> candidate.routeId().equals(selectedRouteId))
                .findFirst()
                .orElseThrow();
        var fallbackCandidate = fallbackCandidate(selectedRoute, gateOutcome.survivingRoutes());

        return new RouteDecisionResult(
                intent,
                gateOutcome.candidateRoutes(),
                gateOutcome.excludedRoutes(),
                gateOutcome.gateResults(),
                scoreResults,
                selectedRoute,
                fallbackCandidate
        );
    }

    private RouteCandidate fallbackCandidate(RouteCandidate selectedRoute, java.util.List<RouteCandidate> survivingRoutes) {
        return survivingRoutes.stream()
                .filter(candidate -> !candidate.routeId().equals(selectedRoute.routeId()))
                .filter(candidate -> "CORRESPONDENT_BANKING".equals(candidate.family()))
                .findFirst()
                .or(() -> survivingRoutes.stream().filter(candidate -> !candidate.routeId().equals(selectedRoute.routeId())).findFirst())
                .orElse(null);
    }
}
