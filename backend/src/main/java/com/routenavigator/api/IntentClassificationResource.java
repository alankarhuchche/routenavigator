package com.routenavigator.api;

import com.routenavigator.service.IntentClassificationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;

@Path("/api/intent/classify")
public class IntentClassificationResource {

    @Inject
    IntentClassificationService intentClassificationService;

    @POST
    public IntentClassificationResponse classify(IntentClassificationRequest request) {
        if (request == null || request.text() == null || request.text().isBlank()) {
            throw new BadRequestException("Request text is required.");
        }
        return intentClassificationService.classify(request.text());
    }
}
