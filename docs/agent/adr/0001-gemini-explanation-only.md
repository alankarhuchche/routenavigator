# ADR 0001 — Gemini is explanation-only; never in the decision path

- Status: accepted
- Date: 2026-06-03

## Context
The demo uses Gemini to explain the route decision to executives. There was a risk that the
model could be positioned as the decision-maker, which would make the system non-deterministic
and unacceptable for a bank-grade reference architecture.

## Decision
Gemini receives only the redacted Decision Trace and may only return explanation text. It has
no API surface for selecting, scoring, approving, or executing anything. All decisioning is
done by the deterministic Java route engine before Gemini is called. If Gemini is unavailable,
the TemplateExplanationService produces deterministic explanation text.

## Consequences
- The app is fully functional with Gemini switched off.
- Executives see AI-generated explanation text; the actual decision evidence is in the trace.
- Any future change that would give Gemini a decision capability is a hard-rule breach (AGENTS §1).
