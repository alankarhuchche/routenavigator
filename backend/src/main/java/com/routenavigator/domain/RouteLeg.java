package com.routenavigator.domain;

public record RouteLeg(
        String legId,
        String type,
        String description,
        String from,
        String to,
        String assetIn,
        String assetOut,
        int estimatedMinutes,
        boolean pointOfNoReturn) {
}
