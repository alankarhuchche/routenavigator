package com.routenavigator.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class RouteCatalogueServiceTest {
    @Inject
    RouteCatalogueService routeCatalogueService;

    @Test
    void loadsRoutesWithLegsFromJson() {
        var routes = routeCatalogueService.findAll();

        assertFalse(routes.isEmpty());
        assertTrue(routes.stream().allMatch(route -> route.simulated()));
        assertTrue(routeCatalogueService.findByRouteId("route-correspondent-banking")
                .orElseThrow()
                .legs()
                .stream()
                .anyMatch(leg -> "CORRESPONDENT_BANKING".equals(leg.type())));
    }
}
