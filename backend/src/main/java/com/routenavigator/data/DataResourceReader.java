package com.routenavigator.data;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;

@ApplicationScoped
public class DataResourceReader {
    private final ObjectMapper objectMapper;

    @Inject
    public DataResourceReader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public <T> List<T> readList(String resourcePath, TypeReference<List<T>> typeReference) {
        try (InputStream inputStream = open(resourcePath)) {
            return objectMapper.readValue(inputStream, typeReference);
        } catch (IOException exception) {
            throw new UncheckedIOException("Unable to read mock data resource " + resourcePath, exception);
        }
    }

    public JsonNode readTree(String resourcePath) {
        try (InputStream inputStream = open(resourcePath)) {
            return objectMapper.readTree(inputStream);
        } catch (IOException exception) {
            throw new UncheckedIOException("Unable to read mock data resource " + resourcePath, exception);
        }
    }

    private InputStream open(String resourcePath) {
        InputStream inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resourcePath);
        if (inputStream == null) {
            throw new IllegalArgumentException("Mock data resource not found: " + resourcePath);
        }
        return inputStream;
    }
}
