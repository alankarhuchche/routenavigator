package com.routenavigator.domain;

public record ExecutionEvent(
        String eventId,
        String traceId,
        String routeId,
        String state,
        String message,
        String occurredAt,
        boolean pointOfNoReturnReached) {
}
