package com.routenavigator.service;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

@RegisterRestClient(configKey = "gemini-api")
@Path("/v1beta/models")
public interface GeminiApiClient {

    @POST
    @Path("/{model}:generateContent")
    GeminiResponse generateContent(
            @PathParam("model") String model,
            @QueryParam("key") String apiKey,
            GeminiRequest request);

    record GeminiRequest(List<Content> contents, GenerationConfig generationConfig) {}

    record Content(List<Part> parts) {}

    record Part(String text) {}

    record GenerationConfig(int maxOutputTokens, double temperature) {}

    record GeminiResponse(List<Candidate> candidates) {}

    record Candidate(Content content) {}
}
