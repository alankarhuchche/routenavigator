package com.routenavigator.domain;

import java.util.List;

public record RouteCandidate(
        String routeId,
        String customerLabel,
        String family,
        String status,
        List<String> reasons) {
}
