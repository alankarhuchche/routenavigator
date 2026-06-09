package com.routenavigator.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThan;

@QuarkusTest
class RouteDecisionEdgeCasesTest {

    @Test
    void unknownScenarioIdReturns4xx() {
        given()
                .contentType("application/json")
                .body("{\"scenarioId\":\"SCN-DOES-NOT-EXIST\"}")
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(greaterThan(399));
    }

    @Test
    void missingScenarioIdInBodyReturns4xx() {
        given()
                .contentType("application/json")
                .body("{}")
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(greaterThan(399));
    }

    @Test
    void unknownTraceIdReturns404() {
        given()
                .when()
                .get("/api/route-decisions/{traceId}", "trace-does-not-exist")
                .then()
                .statusCode(404);
    }

    @Test
    void allSixScenariosProduceATraceWithRequiredFields() {
        for (String scn : new String[]{"SCN-001","SCN-002","SCN-003","SCN-004","SCN-005","SCN-006"}) {
            given()
                    .contentType("application/json")
                    .body("{\"scenarioId\":\"" + scn + "\"}")
                    .when()
                    .post("/api/route-decisions")
                    .then()
                    .statusCode(200)
                    .body("traceId", notNullValue())
                    .body("selectedRoute", notNullValue())
                    .body("gateResults.size()", greaterThan(0))
                    .body("scoreResults.size()", greaterThan(0));
        }
    }
}
