package com.routenavigator.domain;

public record GateResult(
        String routeId,
        String gateId,
        String gateType,
        boolean passed,
        boolean blocking,
        String reasonCode,
        String message) {
}
