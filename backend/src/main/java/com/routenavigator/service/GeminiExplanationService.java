package com.routenavigator.service;

import com.routenavigator.domain.DecisionTrace;
import com.routenavigator.domain.RouteExplanationResponse;

public interface GeminiExplanationService {
    RouteExplanationResponse generateRouteExplanation(DecisionTrace decisionTrace);
}
