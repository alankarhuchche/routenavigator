package com.routenavigator.service;

import com.routenavigator.domain.DecisionTrace;
import com.routenavigator.domain.RouteCandidate;
import com.routenavigator.domain.RouteExplanationResponse;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.stream.Collectors;

public class RealGeminiExplanationService implements GeminiExplanationService {

    private static final Logger LOG = Logger.getLogger(RealGeminiExplanationService.class);

    private final TraceRedactionService traceRedactionService;
    private final GeminiApiClient geminiApiClient;
    private final String apiKey;
    private final String model;

    @Inject
    public RealGeminiExplanationService(
            TraceRedactionService traceRedactionService,
            @RestClient GeminiApiClient geminiApiClient,
            @ConfigProperty(name = "gemini.api-key", defaultValue = "") String apiKey,
            @ConfigProperty(name = "gemini.model", defaultValue = "gemini-2.0-flash") String model) {
        this.traceRedactionService = traceRedactionService;
        this.geminiApiClient = geminiApiClient;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public RouteExplanationResponse generateRouteExplanation(DecisionTrace decisionTrace) {
        DecisionTrace redacted = traceRedactionService.redact(decisionTrace);
        try {
            String prompt = buildPrompt(redacted);
            GeminiApiClient.GeminiRequest request = new GeminiApiClient.GeminiRequest(
                    List.of(new GeminiApiClient.Content(List.of(new GeminiApiClient.Part(prompt)))),
                    new GeminiApiClient.GenerationConfig(512, 0.2)
            );
            GeminiApiClient.GeminiResponse response = geminiApiClient.generateContent(model, apiKey, request);
            String text = response.candidates().get(0).content().parts().get(0).text();
            return new RouteExplanationResponse("GEMINI", true, text, redacted);
        } catch (Exception e) {
            LOG.warnf("Gemini API call failed, falling back to template: %s", e.getMessage());
            String fallback = "Selected " + redacted.selectedRoute().customerLabel()
                    + " because it passed all blocking gates and scored highest for objective "
                    + redacted.customerIntent().objective()
                    + ". Excluded routes remain visible in the Decision Trace with hard-gate reasons. "
                    + "This explanation is generated from redacted trace evidence and cannot affect route selection or execution.";
            return new RouteExplanationResponse("GEMINI_FALLBACK", true, fallback, redacted);
        }
    }

    private String buildPrompt(DecisionTrace trace) {
        String excludedLabels = trace.excludedRoutes() == null ? "none" :
                trace.excludedRoutes().stream()
                        .map(RouteCandidate::customerLabel)
                        .collect(Collectors.joining(", "));

        long passCount = trace.gateResults() == null ? 0 :
                trace.gateResults().stream().filter(g -> g.passed()).count();
        long excludedCount = trace.gateResults() == null ? 0 :
                trace.gateResults().stream().filter(g -> !g.passed()).count();

        return "You are a payments expert explaining a route decision to a business audience.\n\n" +
                "A payment routing engine selected: " + trace.selectedRoute().customerLabel() + "\n" +
                "Objective: " + trace.customerIntent().objective() + "\n" +
                "Excluded routes: " + excludedLabels + "\n" +
                "Gate summary: " + passCount + " pass / " + excludedCount + " excluded\n" +
                "Finality: " + trace.finalityModel() + "\n\n" +
                "Explain in 2-3 plain English sentences why this route was selected and why the others were excluded. " +
                "Focus on the business reason. Do not mention technical IDs or internal system names. " +
                "Do not suggest alternative actions or override the routing decision.";
    }
}
