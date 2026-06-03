package com.routenavigator.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.CoreMatchers.startsWith;

@QuarkusTest
class RouteExplanationResourceTest {
    @Test
    void createsTemplateExplanationFromTraceId() {
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
                .contentType("application/json")
                .body("{\"traceId\":\"" + traceId + "\"}")
                .when()
                .post("/api/explanations/route")
                .then()
                .statusCode(200)
                .body("provider", startsWith("TEMPLATE_FALLBACK"))
                .body("geminiEnabled", equalTo(false))
                .body("explanation", notNullValue())
                .body("redactedTrace.customerIntent.description", equalTo("REDACTED"));
    }
}
