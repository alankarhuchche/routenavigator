# 00 — Mission

## Product thesis
Payment Route Orchestrator is a simulated executive demo for explainable payment route orchestration. A customer expresses a payment outcome — destination, amount, currency, speed/cost/tracking preference and route constraints. The platform generates candidate routes, applies hard gates, scores only executable routes, selects the most efficient executable route, records a Decision Trace, explains the trace using Gemini, and simulates lifecycle tracking.

## What this is
- A demo of the decisioning, explainability and lifecycle model.
- A bank-grade conceptual architecture translated into a working simulated product demo.
- A route comparison and control-room experience showing why a route wins and why alternatives lose.

## What this is not
- Not a live payment system.
- Not connected to SWIFT, Faster Payments, CHAPS, SEPA, stablecoin networks, wallets, FX, liquidity, sanctions, fraud or bank ledgers.
- Not a claim that any specific bank or corporate account can do these routes today.
- Not an AI-autonomous payment engine.

## Core user journey
1. User chooses a demo scenario or enters a payment intent.
2. UI shows structured intent.
3. Backend generates candidate routes.
4. Backend applies hard gates.
5. Backend scores surviving routes.
6. Backend creates a Decision Trace.
7. Gemini explains the redacted trace.
8. User authorises simulated payment.
9. Execution simulator progresses through route-specific states.
10. Tracker and control-room views update from events.

## Target audience
- Payments executives
- Architecture reviewers
- Risk and control stakeholders
- Digital-assets/stablecoin stakeholders
- Engineering leaders

## Demo success criteria
The audience should understand that:
- one rail does not win by default;
- customer intent defines the objective;
- hard gates protect safety and eligibility;
- scoring is only applied to executable routes;
- Decision Trace proves the route decision;
- Gemini explains evidence but does not control money movement;
- execution and fallback are governed by point-of-no-return.
