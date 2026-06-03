package com.routenavigator.api;

import com.routenavigator.domain.RouteExplanationResponse;
import com.routenavigator.service.DecisionTraceService;
import com.routenavigator.service.GeminiExplanationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;

@Path("/api/explanations/route")
public class RouteExplanationResource {
    private final DecisionTraceService decisionTraceService;
    private final GeminiExplanationService geminiExplanationService;

    @Inject
    public RouteExplanationResource(
            DecisionTraceService decisionTraceService,
            GeminiExplanationService geminiExplanationService) {
        this.decisionTraceService = decisionTraceService;
        this.geminiExplanationService = geminiExplanationService;
    }

    @POST
    public RouteExplanationResponse explain(RouteExplanationRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }
        if (request.decisionTrace() != null) {
            return geminiExplanationService.generateRouteExplanation(request.decisionTrace());
        }
        if (request.traceId() != null && !request.traceId().isBlank()) {
            var trace = decisionTraceService.findByTraceId(request.traceId())
                    .orElseThrow(() -> new NotFoundException("Decision Trace not found: " + request.traceId()));
            return geminiExplanationService.generateRouteExplanation(trace);
        }
        throw new BadRequestException("Provide either traceId or decisionTrace.");
    }
}
