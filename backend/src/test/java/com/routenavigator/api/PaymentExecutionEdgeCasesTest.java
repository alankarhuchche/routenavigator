package com.routenavigator.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;

@QuarkusTest
class PaymentExecutionEdgeCasesTest {

    // ── unknown trace id ──────────────────────────────────────────────────────

    @Test
    void authoriseWithUnknownTraceIdReturns404() {
        given()
                .when()
                .post("/api/payments/{traceId}/authorise", "trace-does-not-exist")
                .then()
                .statusCode(404);
    }

    @Test
    void simulateNextWithUnknownTraceIdReturns404() {
        given()
                .when()
                .post("/api/payments/{traceId}/simulate/next", "trace-does-not-exist")
                .then()
                .statusCode(404);
    }

    @Test
    void getStateWithUnknownTraceIdReturns404() {
        given()
                .when()
                .get("/api/payments/{traceId}/state", "trace-does-not-exist")
                .then()
                .statusCode(404);
    }

    // ── idempotency ────────────────────────────────────────────────────────────

    @Test
    void authoriseTwiceDoesNotDuplicateEvents() {
        String traceId = given()
                .contentType("application/json")
                .body("{\"scenarioId\":\"SCN-001\"}")
                .when().post("/api/route-decisions")
                .then().statusCode(200)
                .extract().path("traceId");

        given().when().post("/api/payments/{traceId}/authorise", traceId)
                .then().statusCode(200).body("state", equalTo("AUTHORISED"))
                .body("events.size()", equalTo(1));

        // second call — state must still be AUTHORISED, not regress or add another event
        given().when().post("/api/payments/{traceId}/authorise", traceId)
                .then().statusCode(200).body("state", equalTo("AUTHORISED"))
                .body("events.size()", equalTo(1));
    }

    // ── simulate past terminal state ──────────────────────────────────────────

    @Test
    void simulatingPastCompletedStateDoesNotCrashOrChangeState() {
        String traceId = given()
                .contentType("application/json")
                .body("{\"scenarioId\":\"SCN-001\"}")
                .when().post("/api/route-decisions")
                .then().statusCode(200)
                .extract().path("traceId");

        given().when().post("/api/payments/{traceId}/authorise", traceId).then().statusCode(200);

        // advance until COMPLETED (SCN-001 is short — loop until terminal)
        for (int i = 0; i < 10; i++) {
            String state = given().when()
                    .post("/api/payments/{traceId}/simulate/next", traceId)
                    .then().statusCode(200)
                    .extract().path("state");
            if ("COMPLETED".equals(state) || "INVESTIGATION_REQUIRED".equals(state)) break;
        }

        // one more advance — must return 200 and stay in terminal state, not crash
        String finalState = given().when()
                .post("/api/payments/{traceId}/simulate/next", traceId)
                .then().statusCode(200)
                .extract().path("state");

        assert "COMPLETED".equals(finalState) || "INVESTIGATION_REQUIRED".equals(finalState)
                : "Expected terminal state but got: " + finalState;
    }
}
