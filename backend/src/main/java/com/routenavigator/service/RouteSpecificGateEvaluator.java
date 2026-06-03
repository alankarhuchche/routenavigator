package com.routenavigator.service;

import com.routenavigator.domain.CanonicalRoute;
import com.routenavigator.domain.GateResult;
import com.routenavigator.domain.PaymentIntent;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class RouteSpecificGateEvaluator {
    public List<GateResult> evaluate(PaymentIntent intent, CanonicalRoute route) {
        List<GateResult> results = new ArrayList<>();
        results.add(customerConstraintGate(intent, route));
        results.add(routeFamilyEligibilityGate(intent, route));
        return results;
    }

    private GateResult customerConstraintGate(PaymentIntent intent, CanonicalRoute route) {
        if (!intent.traditionalOnly()) {
            return pass(route, "CUSTOMER_CONSTRAINT", "Customer constraints allow this route family.");
        }

        boolean passed = "CORRESPONDENT_BANKING".equals(route.family())
                || "UK_DOMESTIC_INSTANT".equals(route.family())
                || "UK_HIGH_VALUE_DOMESTIC".equals(route.family())
                || "EUROPEAN_INSTANT_CREDIT_TRANSFER".equals(route.family());
        return result(
                route,
                "CUSTOMER_CONSTRAINT",
                passed,
                passed ? "Customer requested traditional bank transfer only and this route is a bank-transfer family."
                        : "Customer requested traditional bank transfer only; digital, tokenised or partner-payout routes are excluded.",
                "EXCLUDED_CUSTOMER_CONSTRAINT"
        );
    }

    private GateResult routeFamilyEligibilityGate(PaymentIntent intent, CanonicalRoute route) {
        boolean passed = switch (route.family()) {
            case "UK_DOMESTIC_INSTANT" -> isUkDomesticGbp(intent);
            case "CORRESPONDENT_BANKING" -> isBankAccountEndpoint(intent);
            case "LOCAL_PAYOUT_PARTNER" -> isUsBankAccountPayout(intent) && !intent.traditionalOnly();
            case "STABLECOIN_BRIDGE_FIAT_PAYOUT" -> intent.digitalRoutesAllowed()
                    && isUsBankAccountPayout(intent)
                    && !"USDC".equals(intent.sourceAsset())
                    && !intent.traditionalOnly();
            case "WALLET_TO_WALLET_STABLECOIN" -> intent.digitalRoutesAllowed()
                    && "USDC".equals(intent.sourceAsset())
                    && "DIGITAL_WALLET".equals(intent.destinationEndpoint())
                    && !intent.traditionalOnly();
            default -> false;
        };

        return result(
                route,
                "ROUTE_FAMILY_ELIGIBILITY",
                passed,
                passed ? "Payment intent is eligible for this route family."
                        : "Payment intent is not eligible for this route family.",
                "EXCLUDED_ROUTE_ELIGIBILITY"
        );
    }

    private boolean isUkDomesticGbp(PaymentIntent intent) {
        return "GB".equals(intent.sourceCountry())
                && "GB".equals(intent.destinationCountry())
                && "GBP".equals(intent.sourceCurrency())
                && "GBP".equals(intent.targetCurrency())
                && "UK_BANK_ACCOUNT".equals(intent.destinationEndpoint());
    }

    private boolean isBankAccountEndpoint(PaymentIntent intent) {
        return "US_BANK_ACCOUNT".equals(intent.destinationEndpoint())
                || "UK_BANK_ACCOUNT".equals(intent.destinationEndpoint());
    }

    private boolean isUsBankAccountPayout(PaymentIntent intent) {
        return "US".equals(intent.destinationCountry()) && "US_BANK_ACCOUNT".equals(intent.destinationEndpoint());
    }

    private GateResult pass(CanonicalRoute route, String gateId, String message) {
        return new GateResult(route.routeId(), gateId, "ROUTE_SPECIFIC", true, true, "PASS_ROUTE_SPECIFIC_GATES", message);
    }

    private GateResult result(CanonicalRoute route, String gateId, boolean passed, String message, String failedReasonCode) {
        return new GateResult(
                route.routeId(),
                gateId,
                "ROUTE_SPECIFIC",
                passed,
                true,
                passed ? "PASS_ROUTE_SPECIFIC_GATES" : failedReasonCode,
                message
        );
    }
}
