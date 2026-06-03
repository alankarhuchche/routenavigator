package com.routenavigator.domain;

public record EvidenceReference(
        String evidenceId,
        String evidenceType,
        String source,
        String summary,
        boolean simulated) {
}
