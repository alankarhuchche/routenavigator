package com.routenavigator.service;

import com.routenavigator.domain.PaymentIntent;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@QuarkusTest
class TraceRedactionServiceTest {
    @Inject
    RouteDecisionService routeDecisionService;

    @Inject
    DecisionTraceService decisionTraceService;

    @Inject
    TraceRedactionService traceRedactionService;

    @Test
    void masksPiiLikeIntentFieldsBeforeExplanation() {
        var intent = new PaymentIntent(
                "INT-PII",
                "SCN-PII",
                "Send money to Jane Doe account 12345678",
                "GB",
                "US",
                "GBP",
                "USD",
                BigDecimal.valueOf(1000),
                "FASTEST",
                true,
                true,
                false,
                "GBP",
                "US_BANK_ACCOUNT",
                List.of("customer reference Jane Doe")
        );

        var trace = decisionTraceService.createTrace(routeDecisionService.decide(intent));
        var redacted = traceRedactionService.redact(trace);

        assertEquals("REDACTED", redacted.customerIntent().description());
        assertEquals("REDACTED", redacted.customerIntent().sourceAsset());
        assertEquals("REDACTED", redacted.customerIntent().destinationEndpoint());
        assertEquals(List.of("REDACTED_CONSTRAINTS"), redacted.customerIntent().constraints());
        assertFalse(redacted.toString().contains("Jane Doe"));
        assertFalse(redacted.toString().contains("12345678"));
    }
}
