package com.routenavigator.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
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
}
