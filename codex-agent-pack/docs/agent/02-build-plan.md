# 02 — Build Plan

## Phase 1 — Repo foundation
Create monorepo structure with `backend/`, `frontend/`, and `docs/agent/`.

## Phase 2 — Backend domain foundation
Implement Quarkus app skeleton, domain models, scenario loader, route catalogue loader and mock evidence loader.

## Phase 3 — Decision engine
Implement gate evaluation, route scoring, route selection and Decision Trace generation.

## Phase 4 — Frontend static experience
Build React TypeScript UI with scenario selector, payment intent view, route comparison and Decision Trace panel using mock API responses.

## Phase 5 — API integration
Wire frontend to Quarkus APIs.

## Phase 6 — Gemini explanation
Implement trace redaction and Gemini explanation service. Provide deterministic template fallback when Gemini disabled or unavailable.

## Phase 7 — Execution simulator
Implement payment state machine, route-leg simulation, event append and tracker/control-room updates.

## Phase 8 — Fallback scenario
Implement pre-point-of-no-return degradation and fallback to International bank transfer.

## Phase 9 — Demo polish
Add disclaimers, demo script, README, architecture notes, test data coverage and optional Cloud Run packaging.

## Phase 10 — Review and harden
Run tests/build, review terminology, verify no live connectivity, verify Gemini cannot affect decisioning, and verify all live demo scenarios work end-to-end.
