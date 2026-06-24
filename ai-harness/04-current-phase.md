# Current Phase

Phase 3C — Demo launch pack and walkthrough

Execution mode: do not start Phase 3C unless explicitly instructed. Use `ai-harness/program/execution-state.md` and `bash scripts/ai-program-next.sh` to confirm state before any further work.

## Objective

Prepare the demo launch pack, walkthrough script and handoff checklist for Payment Route Intelligence.

## Current Status

- Phase 3A demo journey shell is complete.
- Phase 3A-fix is complete: the active stage is exclusive/page-like and the Journey & Controls map visibility regression is resolved.
- Phase 3B voice intent and trusted agent explanation demo is complete.
- Phase 3B-fix is complete: Secure Intent now uses a controlled intent composer, visible voice affordance and premium preference layout.
- Phase 3 UX-fix is complete locally: Secure Session is now a dedicated first stage and Intent Capture owns the payment outcome composer, voice capture, preferences and demo scenarios.
- Phase 3 UX-fix 2 is complete locally: Secure Session now has a premium landing screen, visible Continue CTA, session readiness sequence and no initial route/debug summary.
- Phase 3 UX-fix 3 is complete locally: a blank first-page report was investigated, fresh runtime smoke checks show Secure Session visible, and a root render fallback plus focused visibility coverage were added.
- Browser voice capture is used only to populate/edit the payment intent field.
- Trusted agent/Gemini explanation remains explanation-only.
- Browser read-aloud uses text-to-speech only.
- Passkey/customer approval remains the only approval mechanism.

## Expected Phase 3C Scope

- Demo walkthrough documentation.
- Launch checklist.
- Safety talking points.
- GCP/GitHub/Cloud Run verification guidance.
- No product feature work unless explicitly approved.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not change backend route logic.
- Do not change API contracts.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 3C

- Files inspected.
- Files changed.
- Demo script/walkthrough summary.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
