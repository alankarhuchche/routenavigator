package com.routenavigator.service;

import com.routenavigator.domain.CanonicalRoute;
import com.routenavigator.domain.ExecutionEvent;
import com.routenavigator.domain.PaymentExecutionSnapshot;
import com.routenavigator.domain.PaymentState;
import com.routenavigator.domain.RouteLeg;
import com.routenavigator.domain.RouteCandidate;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@ApplicationScoped
public class ExecutionSimulatorService {
    private final DecisionTraceService decisionTraceService;
    private final RouteCatalogueService routeCatalogueService;
    private final PaymentStateMachineService paymentStateMachineService;
    private final ConcurrentMap<String, PaymentState> states = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Integer> completedLegIndexes = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> activeRouteIds = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Boolean> fallbackApplied = new ConcurrentHashMap<>();

    @Inject
    public ExecutionSimulatorService(
            DecisionTraceService decisionTraceService,
            RouteCatalogueService routeCatalogueService,
            PaymentStateMachineService paymentStateMachineService) {
        this.decisionTraceService = decisionTraceService;
        this.routeCatalogueService = routeCatalogueService;
        this.paymentStateMachineService = paymentStateMachineService;
    }

    public PaymentExecutionSnapshot authorise(String traceId) {
        var trace = ensureTrace(traceId);
        activeRouteIds.putIfAbsent(traceId, trace.selectedRoute().routeId());
        PaymentState currentState = states.getOrDefault(traceId, PaymentState.CREATED);
        PaymentState nextState = paymentStateMachineService.authorise(currentState);
        states.put(traceId, nextState);
        // only append an event when state actually changed — prevents duplicate events on retry
        if (nextState != currentState) {
            append(traceId, activeRouteIds.get(traceId), nextState.name(), "Simulated payment authorised by user.", false);
        }
        return snapshot(traceId);
    }

    public PaymentExecutionSnapshot simulateNext(String traceId) {
        var trace = ensureTrace(traceId);
        states.putIfAbsent(traceId, PaymentState.AUTHORISED);
        activeRouteIds.putIfAbsent(traceId, trace.selectedRoute().routeId());
        CanonicalRoute route = routeCatalogueService.findByRouteId(activeRouteIds.get(traceId)).orElseThrow();
        int nextLegIndex = completedLegIndexes.getOrDefault(traceId, 0);
        if (nextLegIndex >= route.legs().size()) {
            states.put(traceId, PaymentState.COMPLETED);
            return snapshot(traceId);
        }

        RouteLeg leg = route.legs().get(nextLegIndex);
        boolean finalLegCompleted = nextLegIndex == route.legs().size() - 1;
        PaymentState nextState = paymentStateMachineService.advance(states.get(traceId), leg.pointOfNoReturn(), finalLegCompleted);
        states.put(traceId, nextState);
        completedLegIndexes.put(traceId, nextLegIndex + 1);
        append(traceId, route.routeId(), nextState.name(), "Completed simulated leg: " + leg.description(), leg.pointOfNoReturn());
        return snapshot(traceId);
    }

    public PaymentExecutionSnapshot simulateDegradation(String traceId) {
        var trace = ensureTrace(traceId);
        activeRouteIds.putIfAbsent(traceId, trace.selectedRoute().routeId());
        states.putIfAbsent(traceId, PaymentState.AUTHORISED);

        if (pointOfNoReturnReached(traceId)) {
            states.put(traceId, PaymentState.INVESTIGATION_REQUIRED);
            append(traceId,
                    activeRouteIds.get(traceId),
                    PaymentState.INVESTIGATION_REQUIRED.name(),
                    "Route issue occurred after point-of-no-return; servicing investigation required.",
                    true);
            return snapshot(traceId);
        }

        RouteCandidate fallbackCandidate = trace.fallbackCandidate();
        if (fallbackCandidate == null) {
            states.put(traceId, PaymentState.INVESTIGATION_REQUIRED);
            append(traceId,
                    activeRouteIds.get(traceId),
                    PaymentState.INVESTIGATION_REQUIRED.name(),
                    "Route degradation occurred before point-of-no-return, but no executable alternate route is available.",
                    false);
            return snapshot(traceId);
        }

        activeRouteIds.put(traceId, fallbackCandidate.routeId());
        completedLegIndexes.put(traceId, 0);
        fallbackApplied.put(traceId, true);
        states.put(traceId, PaymentState.IN_PROGRESS);
        append(traceId,
                fallbackCandidate.routeId(),
                "FALLBACK_SELECTED",
                "Fallback selected before point-of-no-return: " + fallbackCandidate.customerLabel() + ".",
                false);
        return snapshot(traceId);
    }

    public PaymentState state(String traceId) {
        ensureTrace(traceId);
        return states.getOrDefault(traceId, PaymentState.CREATED);
    }

    public List<ExecutionEvent> events(String traceId) {
        return ensureTrace(traceId).executionEvents();
    }

    private PaymentExecutionSnapshot snapshot(String traceId) {
        var trace = ensureTrace(traceId);
        String activeRouteId = activeRouteIds.getOrDefault(traceId, trace.selectedRoute().routeId());
        return new PaymentExecutionSnapshot(
                traceId,
                state(traceId),
                activeRouteId,
                pointOfNoReturnReached(traceId),
                fallbackApplied.getOrDefault(traceId, false),
                events(traceId));
    }

    private com.routenavigator.domain.DecisionTrace ensureTrace(String traceId) {
        return decisionTraceService.findByTraceId(traceId)
                .orElseThrow(() -> new NotFoundException("Decision Trace not found: " + traceId));
    }

    private boolean pointOfNoReturnReached(String traceId) {
        return ensureTrace(traceId).executionEvents().stream().anyMatch(ExecutionEvent::pointOfNoReturnReached)
                || states.getOrDefault(traceId, PaymentState.CREATED) == PaymentState.PONR_REACHED;
    }

    private void append(String traceId, String routeId, String state, String message, boolean pointOfNoReturnReached) {
        ExecutionEvent event = new ExecutionEvent(
                "evt-" + UUID.randomUUID(),
                traceId,
                routeId,
                state,
                message,
                Instant.now().toString(),
                pointOfNoReturnReached
        );
        List<ExecutionEvent> updatedEvents = new ArrayList<>(ensureTrace(traceId).executionEvents());
        updatedEvents.add(event);
        decisionTraceService.replaceExecutionEvents(traceId, updatedEvents);
    }
}
