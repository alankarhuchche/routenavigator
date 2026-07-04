package com.routenavigator.domain;

public record CustomerInsightContext(
        String purposeDetected,
        String usualMovementPattern,
        String typicalAmountRange,
        String beneficiaryRelationship,
        String trackingPreference,
        String speedPreference,
        String feeSensitivity,
        String previousRouteExperience,
        String riskNormality,
        String digitalRoutesAllowed,
        Boolean consentForPersonalisedRouting,
        String insightSource) {

    public boolean hasConsent() {
        return Boolean.TRUE.equals(consentForPersonalisedRouting);
    }
}
