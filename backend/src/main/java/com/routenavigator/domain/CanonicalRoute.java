package com.routenavigator.domain;

import java.util.List;

public record CanonicalRoute(
        String routeId,
        String customerLabel,
        String family,
        String description,
        List<String> supportedObjectives,
        List<String> requiredCapabilities,
        List<RouteLeg> legs,
        String pointOfNoReturn,
        String finalityModel,
        boolean simulated) {
}
