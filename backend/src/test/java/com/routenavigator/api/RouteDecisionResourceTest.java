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
                .body("scoreResults.findAll { it.customerFitAdjustment != 0 }.size()", equalTo(0))
                .body("scoreResults.findAll { it.baseScore != it.finalScore }.size()", equalTo(0))
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

    @Test
    void appliesConsentedDemoInsightAndReturnsBoundedScoringEvidence() {
        given()
                .contentType("application/json")
                .body("""
                        {
                          "scenarioId": "SCN-003",
                          "customerInsightUsed": true,
                          "customerInsightContext": {
                            "purposeDetected": "Family support",
                            "usualMovementPattern": "Regular UK to India support movement",
                            "typicalAmountRange": "GBP 1,000-7,000",
                            "beneficiaryRelationship": "Previously paid beneficiary",
                            "trackingPreference": "High",
                            "speedPreference": "High",
                            "feeSensitivity": "High",
                            "previousRouteExperience": "No route-specific previous delay",
                            "riskNormality": "Amount and beneficiary are within normal pattern",
                            "digitalRoutesAllowed": "Customer has allowed digital route options",
                            "consentForPersonalisedRouting": true,
                            "insightSource": "Demo customer profile"
                          }
                        }
                        """)
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(200)
                .body("scoreResults.findAll { it.insightUsed }.size()", greaterThan(0))
                .body("scoreResults.findAll { it.customerFitAdjustment > 10 }.size()", equalTo(0))
                .body("scoreResults.findAll { it.customerFitAdjustment < -5 }.size()", equalTo(0))
                .body("scoreResults.find { it.routeId == 'route-wallet-to-wallet-stablecoin' }.customerFitCapApplied", equalTo(true))
                .body("scoreResults.find { it.routeId == 'route-wallet-to-wallet-stablecoin' }.scoringVersion", equalTo("customer-fit-v1-demo"))
                .body("aiBoundary", equalTo("Gemini may explain a redacted Decision Trace only. It must not select, score, approve, execute, update state, or move money."));
    }

    @Test
    void existingPaymentIntentRequestRemainsBackwardsCompatible() {
        given()
                .contentType("application/json")
                .body("""
                        {
                          "paymentIntent": {
                            "intentId": "INT-COMPAT",
                            "scenarioId": "SCN-COMPAT",
                            "description": "Send GBP 500 to a UK beneficiary as quickly as possible.",
                            "sourceCountry": "GB",
                            "destinationCountry": "GB",
                            "sourceCurrency": "GBP",
                            "targetCurrency": "GBP",
                            "amount": 500,
                            "objective": "FASTEST",
                            "trackingRequired": false,
                            "digitalRoutesAllowed": false,
                            "traditionalOnly": false,
                            "sourceAsset": "GBP",
                            "destinationEndpoint": "UK_BANK_ACCOUNT",
                            "constraints": ["DOMESTIC_ONLY"]
                          }
                        }
                        """)
                .when()
                .post("/api/route-decisions")
                .then()
                .statusCode(200)
                .body("selectedRoute.routeId", equalTo("route-uk-instant-bank-transfer"))
                .body("scoreResults.findAll { it.customerFitAdjustment != 0 }.size()", equalTo(0));
    }
}
