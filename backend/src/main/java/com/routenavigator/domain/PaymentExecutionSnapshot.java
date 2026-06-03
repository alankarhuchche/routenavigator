package com.routenavigator.domain;

import java.util.List;

public record PaymentExecutionSnapshot(
        String traceId,
        PaymentState state,
        List<ExecutionEvent> events) {
}
