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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class IntentClassificationService {

    private static final Logger LOG = Logger.getLogger(IntentClassificationService.class);
    private static final Set<String> VALID_SCENARIO_IDS = Set.of(
            "SCN-001", "SCN-002", "SCN-003", "SCN-004", "SCN-005", "SCN-006");
    private static final Pattern MONEY_PATTERN = Pattern.compile(
            "(?i)\\b(GBP|USD|EUR|INR|CNY|AUD|AED|USDC|£|\\$)\\s?([0-9][0-9,]*(?:\\.\\d{1,2})?)");

    @RestClient
    @Inject
    GeminiApiClient geminiApiClient;

    @ConfigProperty(name = "gemini.enabled", defaultValue = "false")
    boolean geminiEnabled;

    @ConfigProperty(name = "gemini.api-key")
    Optional<String> apiKey;

    @ConfigProperty(name = "gemini.model", defaultValue = "gemini-2.0-flash")
    String model;

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
                {"scenarioId":"SCN-00X","reason":"one sentence plain English explanation of why this scenario matches","amount":"display amount if found or To be confirmed","currency":"GBP/USD/EUR/INR/CNY/AUD/AED/USDC or To be confirmed","sourceCountry":"source country if stated or To be confirmed","source":"source account or To be confirmed","destinationCountry":"destination country if stated or To be confirmed","beneficiaryType":"Bank account/Digital wallet/To be confirmed","objective":"FASTEST/CHEAPEST/MOST_TRANSPARENT","trackingRequired":true,"digitalRoutesAllowed":true,"traditionalOnly":false,"purpose":"short safe payment purpose or To be confirmed","confidence":0.75,"missingFields":["field names that need customer review"]}
                """.formatted(text);

        GeminiApiClient.GeminiRequest request = new GeminiApiClient.GeminiRequest(
                List.of(new GeminiApiClient.Content(List.of(new GeminiApiClient.Part(prompt)))),
                new GeminiApiClient.GenerationConfig(200, 0.1));

        GeminiApiClient.GeminiResponse response = geminiApiClient.generateContent(model, apiKey.get(), request);

        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new RuntimeException("Empty response from Gemini");
        }

        String responseText = response.candidates().get(0).content().parts().get(0).text();

        @SuppressWarnings("unchecked")
        Map<String, Object> parsed = objectMapper.readValue(responseText, Map.class);
        String scenarioId = stringValue(parsed.get("scenarioId"));
        String reason = stringValue(parsed.get("reason"));

        if (scenarioId == null || !VALID_SCENARIO_IDS.contains(scenarioId)) {
            throw new RuntimeException("Invalid scenarioId from Gemini: " + scenarioId);
        }

        return new IntentClassificationResponse(
                scenarioId,
                reason,
                "GEMINI",
                structuredIntentFromMap(text, parsed, "gemini"),
                false,
                List.of("AI structured this draft intent for customer review. It cannot approve, execute, amend, cancel or move money."));
    }

    private IntentClassificationResponse keywordMatch(String text) {
        String t = text == null ? "" : text.toLowerCase();
        IntentClassificationResponse.StructuredIntent structuredIntent = structuredIntentFromRules(text);
        if (t.contains("fallback") || t.contains("degradation") || t.contains("pre-ponr")) {
            return rulesResponse("SCN-006", "Matched to fallback scenario.", structuredIntent);
        }
        if (t.contains("traditional") || t.contains("bank transfer only") || t.contains("no digital")) {
            return rulesResponse("SCN-005", "Matched to traditional bank transfer only.", structuredIntent);
        }
        if (t.contains("wallet") || t.contains("usdc") || t.contains("digital dollar") || t.contains("stablecoin")) {
            return rulesResponse("SCN-003", "Matched to wallet-to-wallet digital dollar transfer.", structuredIntent);
        }
        if (t.contains("cheap") || t.contains("lowest cost") || t.contains("low cost") || t.contains("cheapest")) {
            return rulesResponse("SCN-004", "Matched to cheapest USD route.", structuredIntent);
        }
        if ((t.contains("uk") || t.contains("gbp") || t.contains("britain") || t.contains("domestic"))
                && !t.contains("usd") && !t.contains("dollar") && !t.contains("us bank") && !t.contains("united states")) {
            return rulesResponse("SCN-001", "Matched to UK domestic instant payment.", structuredIntent);
        }
        return rulesResponse("SCN-002", "Matched to international GBP-to-USD fastest route.", structuredIntent);
    }

    private IntentClassificationResponse rulesResponse(
            String scenarioId,
            String reason,
            IntentClassificationResponse.StructuredIntent structuredIntent) {
        return new IntentClassificationResponse(
                scenarioId,
                reason,
                "KEYWORD_MATCH",
                structuredIntent,
                true,
                List.of("Demo fallback structured this intent for customer review. It cannot approve, execute, amend, cancel or move money."));
    }

    private IntentClassificationResponse.StructuredIntent structuredIntentFromRules(String text) {
        String t = text == null ? "" : text.toLowerCase();
        Matcher matcher = MONEY_PATTERN.matcher(text == null ? "" : text);
        String amount = "To be confirmed";
        String currency = "To be confirmed";
        if (matcher.find()) {
            currency = normaliseCurrency(matcher.group(1));
            amount = currency + " " + matcher.group(2);
        }

        String destinationCountry = containsAny(t, "india", "inr", "mumbai", "delhi") ? "India"
                : containsAny(t, "china", "cny", "beijing", "shanghai") ? "China"
                : containsAny(t, "germany", "france", "spain", "italy", "netherlands", "euro", "eur", "sepa") ? "EU"
                : containsAny(t, "australia", "aud", "sydney", "melbourne") ? "Australia"
                : containsAny(t, "uae", "dubai", "aed", "dirham") ? "UAE"
                : containsAny(t, "uk", "britain", "domestic") && !containsAny(t, "usd", "dollar", "united states") ? "United Kingdom"
                : containsAny(t, "us ", "usa", "united states", "usd", "dollar") ? "United States"
                : "To be confirmed";
        String beneficiaryType = containsAny(t, "wallet", "usdc", "stablecoin") ? "Digital wallet"
                : containsAny(t, "bank", "beneficiary", "supplier", "account") ? "Bank account"
                : "To be confirmed";
        String objective = containsAny(t, "cheap", "cheapest", "lowest cost", "low cost") ? "CHEAPEST"
                : containsAny(t, "transparent", "trace", "tracking") ? "MOST_TRANSPARENT"
                : "FASTEST";
        boolean trackingRequired = containsAny(t, "tracking", "track", "trace");
        boolean traditionalOnly = containsAny(t, "traditional", "bank transfer only", "no digital");
        boolean digitalRoutesAllowed = !traditionalOnly && !containsAny(t, "no digital");
        String purpose = containsAny(t, "supplier", "invoice") ? "Supplier payment"
                : containsAny(t, "payroll", "salary") ? "Payroll"
                : "To be confirmed";
        List<String> missingFields = missingFields(amount, destinationCountry, beneficiaryType);

        return new IntentClassificationResponse.StructuredIntent(
                text,
                amount,
                currency,
                containsAny(t, "uk", "gbp", "britain") ? "United Kingdom" : "To be confirmed",
                containsAny(t, "bank account") ? "Bank account" : "To be confirmed",
                destinationCountry,
                beneficiaryType,
                objective,
                trackingRequired,
                digitalRoutesAllowed,
                traditionalOnly,
                purpose,
                missingFields.isEmpty() ? 0.74 : 0.58,
                true,
                "rules",
                missingFields);
    }

    private IntentClassificationResponse.StructuredIntent structuredIntentFromMap(
            String rawText,
            Map<String, Object> parsed,
            String sourceType) {
        String amount = defaultText(parsed.get("amount"));
        String destinationCountry = defaultText(parsed.get("destinationCountry"));
        String beneficiaryType = defaultText(parsed.get("beneficiaryType"));
        return new IntentClassificationResponse.StructuredIntent(
                rawText,
                amount,
                defaultText(parsed.get("currency")),
                defaultText(parsed.get("sourceCountry")),
                defaultText(parsed.get("source")),
                destinationCountry,
                beneficiaryType,
                defaultText(parsed.get("objective"), "FASTEST"),
                booleanValue(parsed.get("trackingRequired")),
                booleanValue(parsed.get("digitalRoutesAllowed")),
                booleanValue(parsed.get("traditionalOnly")),
                defaultText(parsed.get("purpose")),
                doubleValue(parsed.get("confidence"), 0.72),
                true,
                sourceType,
                listValue(parsed.get("missingFields"), missingFields(amount, destinationCountry, beneficiaryType)));
    }

    private static String stringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private static String defaultText(Object value) {
        return defaultText(value, "To be confirmed");
    }

    private static String defaultText(Object value, String fallback) {
        String text = stringValue(value);
        return text == null || text.isBlank() ? fallback : text;
    }

    private static boolean booleanValue(Object value) {
        return value instanceof Boolean b ? b : Boolean.parseBoolean(String.valueOf(value));
    }

    private static double doubleValue(Object value, double fallback) {
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private static List<String> listValue(Object value, List<String> fallback) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).filter(item -> !item.isBlank()).toList();
        }
        return fallback;
    }

    private static List<String> missingFields(String amount, String destinationCountry, String beneficiaryType) {
        java.util.ArrayList<String> missing = new java.util.ArrayList<>();
        if (amount == null || amount.isBlank() || "To be confirmed".equals(amount)) {
            missing.add("amount");
        }
        if (destinationCountry == null || destinationCountry.isBlank() || "To be confirmed".equals(destinationCountry)) {
            missing.add("destinationCountry");
        }
        if (beneficiaryType == null || beneficiaryType.isBlank() || "To be confirmed".equals(beneficiaryType)) {
            missing.add("beneficiaryType");
        }
        return List.copyOf(missing);
    }

    private static boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private static String normaliseCurrency(String raw) {
        return switch (raw.toUpperCase()) {
            case "£" -> "GBP";
            case "$" -> "USD";
            default -> raw.toUpperCase();
        };
    }
}
