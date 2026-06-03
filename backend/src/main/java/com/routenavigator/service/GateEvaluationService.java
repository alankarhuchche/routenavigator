package com.routenavigator.service;

import com.routenavigator.domain.CanonicalRoute;
import com.routenavigator.domain.GateEvaluationOutcome;
import com.routenavigator.domain.GateResult;
import com.routenavigator.domain.PaymentIntent;
import com.routenavigator.domain.RouteCandidate;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class GateEvaluationService {
    public static final String AVAILABLE = "AVAILABLE";
    public static final String EXCLUDED = "EXCLUDED";

    private final UniversalHardGateEvaluator universalHardGateEvaluator;
    private final RouteSpecificGateEvaluator routeSpecificGateEvaluator;

    @Inject
    public GateEvaluationService(
            UniversalHardGateEvaluator universalHardGateEvaluator,
            RouteSpecificGateEvaluator routeSpecificGateEvaluator) {
        this.universalHardGateEvaluator = universalHardGateEvaluator;
        this.routeSpecificGateEvaluator = routeSpecificGateEvaluator;
    }

    public GateEvaluationOutcome evaluate(PaymentIntent intent, List<CanonicalRoute> routes) {
        List<RouteCandidate> candidates = new ArrayList<>();
        List<RouteCandidate> survivingRoutes = new ArrayList<>();
        List<RouteCandidate> excludedRoutes = new ArrayList<>();
        List<GateResult> gateResults = new ArrayList<>();

        for (CanonicalRoute route : routes) {
            List<GateResult> routeGateResults = new ArrayList<>();
            routeGateResults.addAll(universalHardGateEvaluator.evaluate(intent, route));
            routeGateResults.addAll(routeSpecificGateEvaluator.evaluate(intent, route));
            gateResults.addAll(routeGateResults);

            boolean passedBlockingGates = routeGateResults.stream()
                    .filter(GateResult::blocking)
                    .allMatch(GateResult::passed);
            RouteCandidate candidate = new RouteCandidate(
                    route.routeId(),
                    route.customerLabel(),
                    route.family(),
                    passedBlockingGates ? AVAILABLE : EXCLUDED,
                    reasonsFor(routeGateResults, passedBlockingGates)
            );
            candidates.add(candidate);
            if (passedBlockingGates) {
                survivingRoutes.add(candidate);
            } else {
                excludedRoutes.add(candidate);
            }
        }

        return new GateEvaluationOutcome(intent, List.copyOf(candidates), List.copyOf(survivingRoutes),
                List.copyOf(excludedRoutes), List.copyOf(gateResults));
    }

    private List<String> reasonsFor(List<GateResult> routeGateResults, boolean passedBlockingGates) {
        if (passedBlockingGates) {
            return List.of("Passed all blocking hard gates.");
        }
        return routeGateResults.stream()
                .filter(result -> result.blocking() && !result.passed())
                .map(GateResult::message)
                .toList();
    }
}
