package com.routenavigator.api;

import com.routenavigator.domain.DecisionTrace;
import com.routenavigator.domain.PaymentIntent;
import com.routenavigator.service.DecisionTraceService;
import com.routenavigator.service.RouteDecisionService;
import com.routenavigator.service.ScenarioService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;

@Path("/api/route-decisions")
public class RouteDecisionResource {
    private final ScenarioService scenarioService;
    private final RouteDecisionService routeDecisionService;
    private final DecisionTraceService decisionTraceService;

    @Inject
    public RouteDecisionResource(
            ScenarioService scenarioService,
            RouteDecisionService routeDecisionService,
            DecisionTraceService decisionTraceService) {
        this.scenarioService = scenarioService;
        this.routeDecisionService = routeDecisionService;
        this.decisionTraceService = decisionTraceService;
    }

    @POST
    public DecisionTrace create(RouteDecisionRequest request) {
        PaymentIntent intent = intentFrom(request);
        return decisionTraceService.createTrace(routeDecisionService.decide(intent));
    }

    @GET
    @Path("/{traceId}")
    public DecisionTrace get(@PathParam("traceId") String traceId) {
        return decisionTraceService.findByTraceId(traceId)
                .orElseThrow(() -> new NotFoundException("Decision Trace not found: " + traceId));
    }

    private PaymentIntent intentFrom(RouteDecisionRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }
        if (request.paymentIntent() != null) {
            return request.paymentIntent();
        }
        if (request.scenarioId() != null && !request.scenarioId().isBlank()) {
            return scenarioService.findById(request.scenarioId())
                    .orElseThrow(() -> new NotFoundException("Scenario not found: " + request.scenarioId()))
                    .paymentIntent();
        }
        throw new BadRequestException("Provide either scenarioId or paymentIntent.");
    }
}
