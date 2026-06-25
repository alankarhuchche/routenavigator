package com.routenavigator.api;

import java.util.List;

public record IntentClassificationResponse(
        String scenarioId,
        String reason,
        String classifiedBy,
        StructuredIntent structuredIntent,
        boolean fallbackUsed,
        List<String> warnings) {

    public record StructuredIntent(
            String rawText,
            String amount,
            String currency,
            String sourceCountry,
            String source,
            String destinationCountry,
            String beneficiaryType,
            String objective,
            boolean trackingRequired,
            boolean digitalRoutesAllowed,
            boolean traditionalOnly,
            String purpose,
            double confidence,
            boolean needsReview,
            String sourceType,
            List<String> missingFields) {
    }
}
