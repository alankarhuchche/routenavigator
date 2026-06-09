package com.routenavigator.service;

import com.routenavigator.domain.PaymentState;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PaymentStateMachineEdgeCasesTest {
    private final PaymentStateMachineService sm = new PaymentStateMachineService();

    @Test
    void authoriseIsIdempotentOnAlreadyAuthorisedPayment() {
        // calling authorise twice must not regress state
        PaymentState first = sm.authorise(PaymentState.CREATED);
        PaymentState second = sm.authorise(first);
        assertEquals(PaymentState.AUTHORISED, first);
        assertEquals(PaymentState.AUTHORISED, second);
    }

    @Test
    void completedStateIsTerminal() {
        // advancing past COMPLETED must stay COMPLETED, not loop back
        PaymentState result = sm.advance(PaymentState.COMPLETED, false, true);
        assertEquals(PaymentState.COMPLETED, result);
    }

    @Test
    void investigationRequiredStateIsTerminal() {
        // advancing past INVESTIGATION_REQUIRED must stay, not transition
        PaymentState result = sm.advance(PaymentState.INVESTIGATION_REQUIRED, false, false);
        assertEquals(PaymentState.INVESTIGATION_REQUIRED, result);
    }

    @Test
    void finalLegCompletedWinsOverPonrFlag() {
        // if both PONR and final-leg-completed are true, payment should complete
        PaymentState result = sm.advance(PaymentState.IN_PROGRESS, true, true);
        assertEquals(PaymentState.COMPLETED, result);
    }
}
