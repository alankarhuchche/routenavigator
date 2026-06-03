package com.routenavigator.service;

import com.routenavigator.domain.DecisionTrace;
import com.routenavigator.domain.RouteExplanationResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class TemplateExplanationService implements GeminiExplanationService {
    private final TraceRedactionService traceRedactionService;
    private final boolean geminiEnabled;

    @Inject
    public TemplateExplanationService(
            TraceRedactionService traceRedactionService,
            @ConfigProperty(name = "gemini.enabled", defaultValue = "false") boolean geminiEnabled) {
        this.traceRedactionService = traceRedactionService;
        this.geminiEnabled = geminiEnabled;
    }

    @Override
    public RouteExplanationResponse generateRouteExplanation(DecisionTrace decisionTrace) {
        DecisionTrace redactedTrace = traceRedactionService.redact(decisionTrace);
        String explanation = "Selected " + redactedTrace.selectedRoute().customerLabel()
                + " because it passed all blocking gates and scored highest for objective "
                + redactedTrace.customerIntent().objective()
                + ". Excluded routes remain visible in the Decision Trace with hard-gate reasons. "
                + "This explanation is generated from redacted trace evidence and cannot affect route selection or execution.";
        return new RouteExplanationResponse(provider(), geminiEnabled, explanation, redactedTrace);
    }

    private String provider() {
        return geminiEnabled ? "TEMPLATE_FALLBACK_GEMINI_ENABLED" : "TEMPLATE_FALLBACK";
    }
}
