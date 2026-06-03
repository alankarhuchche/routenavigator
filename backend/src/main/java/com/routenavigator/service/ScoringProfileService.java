package com.routenavigator.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.routenavigator.data.DataResourceReader;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class ScoringProfileService {
    private static final String SCORING_POLICIES_RESOURCE = "data/scoring-policies.json";

    private final DataResourceReader dataResourceReader;

    @Inject
    public ScoringProfileService(DataResourceReader dataResourceReader) {
        this.dataResourceReader = dataResourceReader;
    }

    public Map<String, BigDecimal> weightsFor(String objective) {
        JsonNode profile = dataResourceReader.readTree(SCORING_POLICIES_RESOURCE)
                .path("profiles")
                .path(objective);
        if (profile.isMissingNode()) {
            throw new IllegalArgumentException("Unknown scoring objective: " + objective);
        }

        Map<String, BigDecimal> weights = new HashMap<>();
        for (Map.Entry<String, JsonNode> field : profile.properties()) {
            weights.put(field.getKey(), new BigDecimal(field.getValue().asText()));
        }
        return Map.copyOf(weights);
    }
}
