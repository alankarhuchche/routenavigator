package com.routenavigator.service;

import com.routenavigator.domain.CanonicalRoute;
import com.routenavigator.domain.ExecutionEvent;
import com.routenavigator.domain.PaymentExecutionSnapshot;
import com.routenavigator.domain.PaymentState;
import com.routenavigator.domain.RouteLeg;
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
        ensureTrace(traceId);
        PaymentState nextState = paymentStateMachineService.authorise(states.getOrDefault(traceId, PaymentState.CREATED));
        states.put(traceId, nextState);
        append(traceId, nextState, "Simulated payment authorised by user.", false);
        return snapshot(traceId);
    }

    public PaymentExecutionSnapshot simulateNext(String traceId) {
        var trace = ensureTrace(traceId);
        states.putIfAbsent(traceId, PaymentState.AUTHORISED);
        CanonicalRoute route = routeCatalogueService.findByRouteId(trace.selectedRoute().routeId()).orElseThrow();
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
        append(traceId, nextState, "Completed simulated leg: " + leg.description(), leg.pointOfNoReturn());
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
        return new PaymentExecutionSnapshot(traceId, state(traceId), events(traceId));
    }

    private com.routenavigator.domain.DecisionTrace ensureTrace(String traceId) {
        return decisionTraceService.findByTraceId(traceId)
                .orElseThrow(() -> new NotFoundException("Decision Trace not found: " + traceId));
    }

    private void append(String traceId, PaymentState state, String message, boolean pointOfNoReturnReached) {
        ExecutionEvent event = new ExecutionEvent(
                "evt-" + UUID.randomUUID(),
                traceId,
                ensureTrace(traceId).selectedRoute().routeId(),
                state.name(),
                message,
                Instant.now().toString(),
                pointOfNoReturnReached
        );
        List<ExecutionEvent> updatedEvents = new ArrayList<>(ensureTrace(traceId).executionEvents());
        updatedEvents.add(event);
        decisionTraceService.replaceExecutionEvents(traceId, updatedEvents);
    }
}
