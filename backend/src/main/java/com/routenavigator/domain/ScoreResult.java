package com.routenavigator.domain;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ScoreResult(
        String routeId,
        BigDecimal totalScore,
        Map<String, BigDecimal> dimensions,
        List<String> reasons) {
}
