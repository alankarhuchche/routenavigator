package com.routenavigator.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
class PaymentExecutionResourceTest {
    @Test
    void authorisesAndAdvancesPaymentEvents() {
        String traceId = given()
                .contentType("application/json")
                .body("{\"scenarioId\":\"SCN-002\"}")
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(200)
                .extract()
                .path("traceId");

        given()
                .when()
                .post("/api/payments/{traceId}/authorise", traceId)
                .then()
                .statusCode(200)
                .body("state", equalTo("AUTHORISED"))
                .body("events.size()", equalTo(1));

        given()
                .when()
                .post("/api/payments/{traceId}/simulate/next", traceId)
                .then()
                .statusCode(200)
                .body("events.size()", greaterThanOrEqualTo(2));

        given()
                .when()
                .get("/api/route-decisions/{traceId}", traceId)
                .then()
                .statusCode(200)
                .body("executionEvents.size()", greaterThanOrEqualTo(2));
    }

    @Test
    void appliesFallbackForPrePonrDegradation() {
        String traceId = given()
                .contentType("application/json")
                .body("{\"scenarioId\":\"SCN-006\"}")
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(200)
                .extract()
                .path("traceId");

        given()
                .when()
                .post("/api/payments/{traceId}/authorise", traceId)
                .then()
                .statusCode(200);

        given()
                .when()
                .post("/api/payments/{traceId}/simulate/degradation", traceId)
                .then()
                .statusCode(200)
                .body("state", equalTo("IN_PROGRESS"))
                .body("activeRouteId", equalTo("route-correspondent-banking"))
                .body("fallbackApplied", equalTo(true))
                .body("pointOfNoReturnReached", equalTo(false))
                .body("events[-1].state", equalTo("FALLBACK_SELECTED"))
                .body("events[-1].message", containsString("Fallback selected before point-of-no-return"));
    }

    @Test
    void treatsPostPonrDegradationAsInvestigationNotFallback() {
        String traceId = given()
                .contentType("application/json")
                .body("{\"scenarioId\":\"SCN-006\"}")
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(200)
                .extract()
                .path("traceId");

        given().when().post("/api/payments/{traceId}/authorise", traceId).then().statusCode(200);
        given().when().post("/api/payments/{traceId}/simulate/next", traceId).then().statusCode(200);
        given().when().post("/api/payments/{traceId}/simulate/next", traceId).then().statusCode(200)
                .body("pointOfNoReturnReached", equalTo(true));

        given()
                .when()
                .post("/api/payments/{traceId}/simulate/degradation", traceId)
                .then()
                .statusCode(200)
                .body("state", equalTo("INVESTIGATION_REQUIRED"))
                .body("activeRouteId", equalTo("route-stablecoin-bridge-fiat-payout"))
                .body("fallbackApplied", equalTo(false))
                .body("events[-1].state", equalTo("INVESTIGATION_REQUIRED"))
                .body("events[-1].message", not(containsString("Fallback")))
                .body("events[-1].message", not(containsString("fallback")));
    }
}
