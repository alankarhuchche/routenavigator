package com.routenavigator.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.Optional;

@ApplicationScoped
public class GeminiServiceProducer {

    @Inject
    TraceRedactionService traceRedactionService;

    @Inject
    @RestClient
    GeminiApiClient geminiApiClient;

    @ConfigProperty(name = "gemini.enabled", defaultValue = "false")
    boolean geminiEnabled;

    @ConfigProperty(name = "gemini.api-key")
    Optional<String> apiKey;

    @Produces
    @ApplicationScoped
    public GeminiExplanationService produceExplanationService() {
        if (geminiEnabled && apiKey.isPresent() && !apiKey.get().isBlank()) {
            return new RealGeminiExplanationService(traceRedactionService, geminiApiClient, apiKey.get());
        }
        return new TemplateExplanationService(traceRedactionService, geminiEnabled);
    }
}
