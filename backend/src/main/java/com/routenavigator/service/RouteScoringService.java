package com.routenavigator.service;

import com.routenavigator.domain.PaymentIntent;
import com.routenavigator.domain.RouteCandidate;
import com.routenavigator.domain.ScoreResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class RouteScoringService {
    private final ScoringProfileService scoringProfileService;

    @Inject
    public RouteScoringService(ScoringProfileService scoringProfileService) {
        this.scoringProfileService = scoringProfileService;
    }

    public List<ScoreResult> score(PaymentIntent intent, List<RouteCandidate> survivingRoutes) {
        Map<String, BigDecimal> weights = scoringProfileService.weightsFor(intent.objective());
        return survivingRoutes.stream()
                .map(candidate -> scoreCandidate(candidate, weights))
                .sorted(Comparator.comparing(ScoreResult::totalScore).reversed().thenComparing(ScoreResult::routeId))
                .toList();
    }

    private ScoreResult scoreCandidate(RouteCandidate candidate, Map<String, BigDecimal> weights) {
        if (!GateEvaluationService.AVAILABLE.equals(candidate.status())) {
            throw new IllegalArgumentException("RouteScoringService received non-surviving route: " + candidate.routeId());
        }

        Map<String, BigDecimal> dimensions = baseDimensions(candidate.family());
        BigDecimal total = weights.entrySet().stream()
                .map(entry -> dimensions.getOrDefault(entry.getKey(), BigDecimal.ZERO).multiply(entry.getValue()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        return new ScoreResult(candidate.routeId(), total, dimensions, List.of("Scored using " + candidate.family() + " illustrative demo dimensions."));
    }

    private Map<String, BigDecimal> baseDimensions(String family) {
        return switch (family) {
            case "UK_DOMESTIC_INSTANT" -> dimensions(98, 95, 95, 75);
            case "CORRESPONDENT_BANKING" -> dimensions(35, 55, 90, 85);
            case "LOCAL_PAYOUT_PARTNER" -> dimensions(55, 95, 80, 70);
            case "STABLECOIN_BRIDGE_FIAT_PAYOUT" -> dimensions(92, 70, 72, 80);
            case "WALLET_TO_WALLET_STABLECOIN" -> dimensions(99, 88, 70, 90);
            default -> dimensions(0, 0, 0, 0);
        };
    }

    private Map<String, BigDecimal> dimensions(int speed, int cost, int certainty, int transparency) {
        return Map.of(
                "speed", BigDecimal.valueOf(speed),
                "cost", BigDecimal.valueOf(cost),
                "certainty", BigDecimal.valueOf(certainty),
                "transparency", BigDecimal.valueOf(transparency)
        );
    }
}
