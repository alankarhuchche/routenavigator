package com.routenavigator.api;

import com.routenavigator.domain.ExecutionEvent;
import com.routenavigator.domain.PaymentExecutionSnapshot;
import com.routenavigator.domain.PaymentState;
import com.routenavigator.service.ExecutionSimulatorService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;

import java.util.List;

@Path("/api/payments/{traceId}")
public class PaymentExecutionResource {
    private final ExecutionSimulatorService executionSimulatorService;

    @Inject
    public PaymentExecutionResource(ExecutionSimulatorService executionSimulatorService) {
        this.executionSimulatorService = executionSimulatorService;
    }

    @POST
    @Path("/authorise")
    public PaymentExecutionSnapshot authorise(@PathParam("traceId") String traceId) {
        return executionSimulatorService.authorise(traceId);
    }

    @POST
    @Path("/simulate/next")
    public PaymentExecutionSnapshot simulateNext(@PathParam("traceId") String traceId) {
        return executionSimulatorService.simulateNext(traceId);
    }

    @GET
    @Path("/state")
    public PaymentState state(@PathParam("traceId") String traceId) {
        return executionSimulatorService.state(traceId);
    }

    @GET
    @Path("/events")
    public List<ExecutionEvent> events(@PathParam("traceId") String traceId) {
        return executionSimulatorService.events(traceId);
    }
}
