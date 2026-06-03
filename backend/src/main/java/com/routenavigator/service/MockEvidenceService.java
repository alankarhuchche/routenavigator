package com.routenavigator.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.routenavigator.data.DataResourceReader;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Map;

@ApplicationScoped
public class MockEvidenceService {
    private final DataResourceReader dataResourceReader;

    @Inject
    public MockEvidenceService(DataResourceReader dataResourceReader) {
        this.dataResourceReader = dataResourceReader;
    }

    public Map<String, JsonNode> loadEvidenceSets() {
        return Map.of(
                "fxQuotes", dataResourceReader.readTree("data/mock-fx-quotes.json"),
                "liquidity", dataResourceReader.readTree("data/mock-liquidity.json"),
                "compliance", dataResourceReader.readTree("data/mock-compliance.json"),
                "routeHealth", dataResourceReader.readTree("data/mock-route-health.json"),
                "beneficiaries", dataResourceReader.readTree("data/mock-beneficiaries.json")
        );
    }
}
