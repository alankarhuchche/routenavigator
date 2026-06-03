package com.routenavigator.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThan;

@QuarkusTest
class RouteDecisionResourceTest {
    @Test
    void createsAndRetrievesDecisionTrace() {
        String traceId = given()
                .contentType("application/json")
                .body("{\"scenarioId\":\"SCN-002\"}")
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(200)
                .body("traceId", notNullValue())
                .body("selectedRoute.routeId", equalTo("route-stablecoin-bridge-fiat-payout"))
                .body("excludedRoutes.size()", greaterThan(0))
                .body("scoreResults.size()", greaterThan(0))
                .extract()
                .path("traceId");

        given()
                .when()
                .get("/api/route-decisions/{traceId}", traceId)
                .then()
                .statusCode(200)
                .body("traceId", equalTo(traceId))
                .body("selectedRoute.family", equalTo("STABLECOIN_BRIDGE_FIAT_PAYOUT"));
    }
}
