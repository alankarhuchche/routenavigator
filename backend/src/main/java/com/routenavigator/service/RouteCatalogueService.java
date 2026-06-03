package com.routenavigator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.routenavigator.data.DataResourceReader;
import com.routenavigator.domain.CanonicalRoute;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class RouteCatalogueService {
    private static final String ROUTE_CATALOGUE_RESOURCE = "data/route-catalogue.json";

    private final DataResourceReader dataResourceReader;

    @Inject
    public RouteCatalogueService(DataResourceReader dataResourceReader) {
        this.dataResourceReader = dataResourceReader;
    }

    public List<CanonicalRoute> findAll() {
        return dataResourceReader.readList(ROUTE_CATALOGUE_RESOURCE, new TypeReference<>() {
        });
    }

    public Optional<CanonicalRoute> findByRouteId(String routeId) {
        return findAll().stream()
                .filter(route -> route.routeId().equals(routeId))
                .findFirst();
    }
}
