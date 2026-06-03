package com.routenavigator.service;

import com.routenavigator.domain.PaymentState;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PaymentStateMachineServiceTest {
    private final PaymentStateMachineService stateMachine = new PaymentStateMachineService();

    @Test
    void advancesThroughAuthorisedPonrAndCompleteStates() {
        assertEquals(PaymentState.AUTHORISED, stateMachine.authorise(PaymentState.CREATED));
        assertEquals(PaymentState.IN_PROGRESS, stateMachine.advance(PaymentState.AUTHORISED, false, false));
        assertEquals(PaymentState.PONR_REACHED, stateMachine.advance(PaymentState.IN_PROGRESS, true, false));
        assertEquals(PaymentState.COMPLETED, stateMachine.advance(PaymentState.PONR_REACHED, false, true));
    }
}
