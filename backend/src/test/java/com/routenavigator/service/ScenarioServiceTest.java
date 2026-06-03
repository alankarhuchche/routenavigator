package com.routenavigator.service;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class ScenarioServiceTest {
    @Inject
    ScenarioService scenarioService;

    @Test
    void loadsDemoScenariosFromJson() {
        var scenarios = scenarioService.findAll();

        assertEquals(6, scenarios.size());
        assertTrue(scenarios.stream().allMatch(scenario -> scenario.simulated()));
        assertEquals("route-stablecoin-bridge-fiat-payout",
                scenarioService.findById("SCN-002").orElseThrow().expectedWinnerRouteId());
    }
}
