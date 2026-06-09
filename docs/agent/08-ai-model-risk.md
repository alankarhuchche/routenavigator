# 08 — AI / Model Risk (Gemini explanation service)

## Hard boundary (restates AGENTS.md §1)
Gemini may only generate explanation text from a redacted Decision Trace.
Gemini must never: select a route, score a route, approve execution, update payment state,
override a gate, or move simulated value.
Gemini output is never fed back as an instruction or decision input.

## What Gemini receives
Only the output of TraceRedactionService — a subset of the Decision Trace with PII-like fields
removed or masked. It does not receive: raw customer input, beneficiary data, account numbers,
wallet addresses, API keys, or any data that could identify a real person.

## Prompt-injection defence
Fields in the Decision Trace (beneficiary name, reference text, free-text memo) may contain
user-influenced content. These are passed as labelled data, not instructions. The Gemini prompt
instructs the model to treat them as data only.

## Output validation
- Gemini output is used for display text only.
- If the response is empty, malformed, or an error occurs, the app falls back to the
  deterministic TemplateExplanationService — the decision flow is never blocked.
- Output is not parsed for structured decisions; it is rendered as plain explanation text.

## Model governance
- Model: Gemini 2.0 Flash (via RealGeminiExplanationService / MicroProfile REST Client).
- Enabled only when GEMINI_ENABLED=true AND GEMINI_API_KEY is set.
- Prompt template is versioned in RealGeminiExplanationService.java — changes go through review.
- No production monitoring yet (demo). If promoted to production, add: fallback-rate tracking,
  latency monitoring, and a factual-accuracy review process.

## Tests that prove the boundary
- TraceRedactionServiceTest: proves no PII-like fields reach the model.
- RouteExplanationResourceTest: proves template fallback works when Gemini is disabled.
- No test yet proves injection resistance (gap — add if promoting to production).
