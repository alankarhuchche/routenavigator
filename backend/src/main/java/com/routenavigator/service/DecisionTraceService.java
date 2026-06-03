package com.routenavigator.service;

import com.routenavigator.domain.CanonicalRoute;
import com.routenavigator.domain.DecisionTrace;
import com.routenavigator.domain.EvidenceReference;
import com.routenavigator.domain.RouteCandidate;
import com.routenavigator.domain.RouteDecisionResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@ApplicationScoped
public class DecisionTraceService {
    private static final String AI_BOUNDARY = "Gemini may explain a redacted Decision Trace only. It must not select, score, approve, execute, update state, or move money.";

    private final RouteCatalogueService routeCatalogueService;
    private final ConcurrentMap<String, DecisionTrace> traces = new ConcurrentHashMap<>();

    @Inject
    public DecisionTraceService(RouteCatalogueService routeCatalogueService) {
        this.routeCatalogueService = routeCatalogueService;
    }

    public DecisionTrace createTrace(RouteDecisionResult decisionResult) {
        CanonicalRoute selectedCanonicalRoute = routeCatalogueService.findByRouteId(decisionResult.selectedRoute().routeId())
                .orElseThrow();
        String traceId = "trace-" + UUID.randomUUID();
        DecisionTrace trace = new DecisionTrace(
                traceId,
                decisionResult.paymentIntent().scenarioId(),
                Instant.now(),
                decisionResult.paymentIntent(),
                decisionResult.candidateRoutes(),
                decisionResult.gateResults(),
                decisionResult.excludedRoutes(),
                decisionResult.scoreResults(),
                decisionResult.selectedRoute(),
                alternativeReasons(decisionResult),
                selectedCanonicalRoute.pointOfNoReturn(),
                selectedCanonicalRoute.finalityModel(),
                decisionResult.fallbackCandidate(),
                evidenceReferences(decisionResult.selectedRoute()),
                AI_BOUNDARY,
                List.of(),
                true
        );
        traces.put(traceId, trace);
        return trace;
    }

    public Optional<DecisionTrace> findByTraceId(String traceId) {
        return Optional.ofNullable(traces.get(traceId));
    }

    private List<String> alternativeReasons(RouteDecisionResult decisionResult) {
        return decisionResult.candidateRoutes().stream()
                .filter(candidate -> !candidate.routeId().equals(decisionResult.selectedRoute().routeId()))
                .map(candidate -> {
                    if (GateEvaluationService.EXCLUDED.equals(candidate.status())) {
                        return candidate.customerLabel() + " excluded: " + String.join(" ", candidate.reasons());
                    }
                    return candidate.customerLabel() + " passed gates but scored below selected route for objective "
                            + decisionResult.paymentIntent().objective() + ".";
                })
                .toList();
    }

    private List<EvidenceReference> evidenceReferences(RouteCandidate selectedRoute) {
        return List.of(
                new EvidenceReference("evidence-gates", "GATE_EVIDENCE", "local-json", "Simulated gate evidence for " + selectedRoute.customerLabel(), true),
                new EvidenceReference("evidence-scoring", "SCORING_POLICY", "local-json", "Illustrative scoring policy and route dimensions.", true),
                new EvidenceReference("evidence-route-catalogue", "ROUTE_CATALOGUE", "local-json", "Simulated route catalogue entry for " + selectedRoute.family(), true)
        );
    }
}
