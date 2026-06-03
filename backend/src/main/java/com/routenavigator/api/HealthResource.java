package com.routenavigator.api;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/api/health")
public class HealthResource {

    @GET
    public HealthStatus health() {
        return new HealthStatus("ok", "payment-route-orchestrator-demo");
    }

    public record HealthStatus(String status, String service) {
    }
}
