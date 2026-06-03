package com.routenavigator.service;

import com.routenavigator.domain.PaymentState;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PaymentStateMachineService {
    public PaymentState authorise(PaymentState currentState) {
        if (currentState != PaymentState.CREATED) {
            return currentState;
        }
        return PaymentState.AUTHORISED;
    }

    public PaymentState advance(PaymentState currentState, boolean pointOfNoReturnReached, boolean finalLegCompleted) {
        if (currentState == PaymentState.COMPLETED || currentState == PaymentState.INVESTIGATION_REQUIRED) {
            return currentState;
        }
        if (finalLegCompleted) {
            return PaymentState.COMPLETED;
        }
        if (pointOfNoReturnReached) {
            return PaymentState.PONR_REACHED;
        }
        return PaymentState.IN_PROGRESS;
    }
}
