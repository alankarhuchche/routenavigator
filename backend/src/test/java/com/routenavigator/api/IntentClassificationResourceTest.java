package com.routenavigator.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;

@QuarkusTest
class IntentClassificationResourceTest {

    @Test
    void classifiesUkPaymentByKeyword() {
        given()
                .contentType("application/json")
                .body("{\"text\": \"send GBP 500 to a UK bank\"}")
                .when()
                .post("/api/intent/classify")
                .then()
                .statusCode(200)
                .body("scenarioId", equalTo("SCN-001"))
                .body("classifiedBy", equalTo("KEYWORD_MATCH"));
    }

    @Test
    void rejectsMissingText() {
        given()
                .contentType("application/json")
                .body("{}")
                .when()
                .post("/api/intent/classify")
                .then()
                .statusCode(400);
    }
}
