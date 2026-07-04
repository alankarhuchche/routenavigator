package com.routenavigator.service;

import com.routenavigator.domain.CustomerFitResult;
import com.routenavigator.domain.CustomerInsightContext;
import com.routenavigator.domain.RouteCandidate;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@ApplicationScoped
public class CustomerFitScoringService {
    static final BigDecimal MIN_ADJUSTMENT = BigDecimal.valueOf(-5);
    static final BigDecimal MAX_ADJUSTMENT = BigDecimal.TEN;

    public CustomerFitResult score(
            RouteCandidate candidate,
            Map<String, BigDecimal> dimensions,
            Boolean customerInsightUsed,
            CustomerInsightContext context) {
        if (!GateEvaluationService.AVAILABLE.equals(candidate.status())) {
            throw new IllegalArgumentException("Customer fit received non-surviving route: " + candidate.routeId());
        }
        if (!Boolean.TRUE.equals(customerInsightUsed) || context == null || !context.hasConsent()) {
            return new CustomerFitResult(BigDecimal.ZERO.setScale(2), List.of(), false, false);
        }

        List<String> reasons = new ArrayList<>();
        BigDecimal raw = BigDecimal.ZERO;

        if (contains(context.purposeDetected(), "family support")) {
            raw = add(raw, points(2), reasons, "Declared family-support purpose adds a small certainty-oriented fit signal.");
        }
        if (contains(context.beneficiaryRelationship(), "previously paid")) {
            raw = add(raw, points(1.5), reasons, "Previously paid beneficiary adds a small fit nudge; validation still applies.");
        }
        if (isHigh(context.trackingPreference()) && dimensionAtLeast(dimensions, "transparency", 80)) {
            raw = add(raw, points(2), reasons, "High tracking preference favours strong route transparency.");
        }
        if (isHigh(context.speedPreference()) && dimensionAtLeast(dimensions, "speed", 90)) {
            raw = add(raw, points(2), reasons, "High speed preference favours a faster eligible route.");
        }
        if (isMediumOrHigh(context.feeSensitivity()) && dimensionAtLeast(dimensions, "cost", 85)) {
            raw = add(raw, points(1.5), reasons, "Fee sensitivity favours a lower-cost eligible route.");
        }
        if (contains(context.riskNormality(), "normal pattern")) {
            raw = add(raw, points(1), reasons, "Demo context represents the amount and beneficiary as within the normal pattern.");
        }
        if (isDigitalFamily(candidate.family()) && contains(context.digitalRoutesAllowed(), "allowed")) {
            raw = add(raw, points(1), reasons, "Digital route consideration is consented and the route already passed eligibility gates.");
        }
        if (previousDelayMatches(context.previousRouteExperience(), candidate.family())) {
            raw = add(raw, points(-3), reasons, "A previous delay on this route family applies a small fit penalty.");
        }

        BigDecimal bounded = raw.max(MIN_ADJUSTMENT).min(MAX_ADJUSTMENT).setScale(2, RoundingMode.HALF_UP);
        return new CustomerFitResult(bounded, List.copyOf(reasons), raw.compareTo(bounded) != 0, true);
    }

    private BigDecimal add(BigDecimal total, BigDecimal value, List<String> reasons, String reason) {
        reasons.add((value.signum() >= 0 ? "+" : "") + value.stripTrailingZeros().toPlainString() + " - " + reason);
        return total.add(value);
    }

    private boolean dimensionAtLeast(Map<String, BigDecimal> dimensions, String dimension, int threshold) {
        return dimensions.getOrDefault(dimension, BigDecimal.ZERO).compareTo(BigDecimal.valueOf(threshold)) >= 0;
    }

    private boolean isHigh(String value) {
        return "high".equals(normalise(value));
    }

    private boolean isMediumOrHigh(String value) {
        String normalised = normalise(value);
        return "medium".equals(normalised) || "high".equals(normalised);
    }

    private boolean isDigitalFamily(String family) {
        return family != null && (family.contains("STABLECOIN") || family.contains("WALLET"));
    }

    private boolean previousDelayMatches(String previousExperience, String family) {
        String experience = normalise(previousExperience);
        if (!experience.contains("delay")) {
            return false;
        }
        return (experience.contains("correspondent") && "CORRESPONDENT_BANKING".equals(family))
                || (experience.contains("digital") && isDigitalFamily(family));
    }

    private boolean contains(String value, String expected) {
        return normalise(value).contains(expected);
    }

    private String normalise(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private BigDecimal points(double value) {
        return BigDecimal.valueOf(value);
    }
}
