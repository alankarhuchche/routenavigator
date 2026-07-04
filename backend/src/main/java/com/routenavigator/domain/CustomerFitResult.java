package com.routenavigator.domain;

import java.math.BigDecimal;
import java.util.List;

public record CustomerFitResult(
        BigDecimal adjustment,
        List<String> reasons,
        boolean capApplied,
        boolean insightUsed) {
}
