package com.routenavigator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.routenavigator.data.DataResourceReader;
import com.routenavigator.domain.Scenario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ScenarioService {
    private static final String SCENARIOS_RESOURCE = "data/scenarios.json";

    private final DataResourceReader dataResourceReader;

    @Inject
    public ScenarioService(DataResourceReader dataResourceReader) {
        this.dataResourceReader = dataResourceReader;
    }

    public List<Scenario> findAll() {
        return dataResourceReader.readList(SCENARIOS_RESOURCE, new TypeReference<>() {
        });
    }

    public Optional<Scenario> findById(String scenarioId) {
        return findAll().stream()
                .filter(scenario -> scenario.scenarioId().equals(scenarioId))
                .findFirst();
    }
}
