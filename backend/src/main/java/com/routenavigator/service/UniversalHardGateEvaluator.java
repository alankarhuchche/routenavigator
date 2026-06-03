package com.routenavigator.service;

import com.routenavigator.domain.CanonicalRoute;
import com.routenavigator.domain.GateResult;
import com.routenavigator.domain.PaymentIntent;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class UniversalHardGateEvaluator {
    public List<GateResult> evaluate(PaymentIntent intent, CanonicalRoute route) {
        List<GateResult> results = new ArrayList<>();
        results.add(pass(route, "COMPLIANCE", "Simulated compliance screening passed."));
        results.add(pass(route, "SANCTIONS", "Simulated sanctions screening passed."));
        results.add(amountGate(intent, route));
        results.add(pass(route, "LIQUIDITY", "Illustrative liquidity is available for this route."));
        results.add(pass(route, "ROUTE_HEALTH", "Simulated route health is healthy."));
        return results;
    }

    private GateResult amountGate(PaymentIntent intent, CanonicalRoute route) {
        boolean passed = intent.amount() != null && intent.amount().compareTo(BigDecimal.ZERO) > 0;
        return new GateResult(
                route.routeId(),
                "VALID_AMOUNT",
                "UNIVERSAL",
                passed,
                true,
                passed ? "PASS_UNIVERSAL_GATES" : "EXCLUDED_INVALID_AMOUNT",
                passed ? "Payment amount is positive." : "Payment amount must be positive."
        );
    }

    private GateResult pass(CanonicalRoute route, String gateId, String message) {
        return new GateResult(route.routeId(), gateId, "UNIVERSAL", true, true, "PASS_UNIVERSAL_GATES", message);
    }
}
