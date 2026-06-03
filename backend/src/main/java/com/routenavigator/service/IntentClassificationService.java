package com.routenavigator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.routenavigator.api.IntentClassificationResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@ApplicationScoped
public class IntentClassificationService {

    private static final Logger LOG = Logger.getLogger(IntentClassificationService.class);
    private static final Set<String> VALID_SCENARIO_IDS = Set.of(
            "SCN-001", "SCN-002", "SCN-003", "SCN-004", "SCN-005", "SCN-006");

    @RestClient
    @Inject
    GeminiApiClient geminiApiClient;

    @ConfigProperty(name = "gemini.enabled", defaultValue = "false")
    boolean geminiEnabled;

    @ConfigProperty(name = "gemini.api-key")
    Optional<String> apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public IntentClassificationResponse classify(String text) {
        if (geminiEnabled && apiKey.isPresent() && !apiKey.get().isBlank()) {
            try {
                return classifyWithGemini(text);
            } catch (Exception e) {
                LOG.warnf("Gemini classification failed, falling back to keyword match: %s", e.getMessage());
            }
        }
        return keywordMatch(text);
    }

    private IntentClassificationResponse classifyWithGemini(String text) throws Exception {
        String prompt = """
                You are a payment routing assistant. Given a natural language payment request, identify the best matching scenario from this list:

                SCN-001: UK instant payment — domestic GBP transfer between UK bank accounts, fastest
                SCN-002: USD to US fastest — international GBP-to-USD payment to a US bank account, fastest with tracking
                SCN-003: USDC wallet-to-wallet — digital dollar (USDC) transfer between crypto/digital wallets
                SCN-004: USD cheapest — international GBP-to-USD payment, cheapest route preferred
                SCN-005: Traditional bank transfer only — no digital routes allowed, correspondent banking only
                SCN-006: Fallback before PONR — scenario demonstrating pre-point-of-no-return route degradation

                Payment request: "%s"

                Respond with JSON only, no markdown, no code block:
                {"scenarioId":"SCN-00X","reason":"one sentence plain English explanation of why this scenario matches"}
                """.formatted(text);

        GeminiApiClient.GeminiRequest request = new GeminiApiClient.GeminiRequest(
                List.of(new GeminiApiClient.Content(List.of(new GeminiApiClient.Part(prompt)))),
                new GeminiApiClient.GenerationConfig(200, 0.1));

        GeminiApiClient.GeminiResponse response = geminiApiClient.generateContent(apiKey.get(), request);

        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new RuntimeException("Empty response from Gemini");
        }

        String responseText = response.candidates().get(0).content().parts().get(0).text();

        @SuppressWarnings("unchecked")
        Map<String, String> parsed = objectMapper.readValue(responseText, Map.class);
        String scenarioId = parsed.get("scenarioId");
        String reason = parsed.get("reason");

        if (scenarioId == null || !VALID_SCENARIO_IDS.contains(scenarioId)) {
            throw new RuntimeException("Invalid scenarioId from Gemini: " + scenarioId);
        }

        return new IntentClassificationResponse(scenarioId, reason, "GEMINI");
    }

    private IntentClassificationResponse keywordMatch(String text) {
        String t = text == null ? "" : text.toLowerCase();
        if (t.contains("fallback") || t.contains("degradation") || t.contains("pre-ponr")) {
            return new IntentClassificationResponse("SCN-006", "Matched to fallback scenario.", "KEYWORD_MATCH");
        }
        if (t.contains("traditional") || t.contains("bank transfer only") || t.contains("no digital")) {
            return new IntentClassificationResponse("SCN-005", "Matched to traditional bank transfer only.", "KEYWORD_MATCH");
        }
        if (t.contains("wallet") || t.contains("usdc") || t.contains("digital dollar") || t.contains("stablecoin")) {
            return new IntentClassificationResponse("SCN-003", "Matched to wallet-to-wallet digital dollar transfer.", "KEYWORD_MATCH");
        }
        if (t.contains("cheap") || t.contains("lowest cost") || t.contains("low cost") || t.contains("cheapest")) {
            return new IntentClassificationResponse("SCN-004", "Matched to cheapest USD route.", "KEYWORD_MATCH");
        }
        if ((t.contains("uk") || t.contains("gbp") || t.contains("britain") || t.contains("domestic"))
                && !t.contains("usd") && !t.contains("dollar") && !t.contains("us bank") && !t.contains("united states")) {
            return new IntentClassificationResponse("SCN-001", "Matched to UK domestic instant payment.", "KEYWORD_MATCH");
        }
        return new IntentClassificationResponse("SCN-002", "Matched to international GBP-to-USD fastest route.", "KEYWORD_MATCH");
    }
}
