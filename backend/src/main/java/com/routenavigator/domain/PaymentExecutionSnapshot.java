package com.routenavigator.domain;

import java.util.List;

public record PaymentExecutionSnapshot(
        String traceId,
        PaymentState state,
        String activeRouteId,
        boolean pointOfNoReturnReached,
        boolean fallbackApplied,
        List<ExecutionEvent> events) {
}
