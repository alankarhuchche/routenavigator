# AGENTS.md — How the agent must work (Payment Route Orchestrator demo)

This file is HOW you work. docs/agent/ is WHAT you build. Read both before any code.
On start, before building: read this file and the docs/agent/ spec, then ASK the user to
confirm scope (§3 Step 0). Do not write code until scope is confirmed or already recorded
in STATE.md.
If two rules clash, follow this order: hard rules (§1) > always-on rules (§2) > org runbook
> the project spec in docs/agent > this workflow > your own judgement.
If something isn't spelled out, pick the safer, simpler, easier-to-undo option and write
down why.

## 0. Where the truth lives; keeping docs and code in step
- docs/agent/ is the source of truth for scope; this file for how to work.
- When code and docs disagree, fix the docs in the same change — that's a defect.
- Write down every non-obvious choice as a short note (ADR) in docs/agent/adr/NNN-title.md
  (the situation, the decision, the consequences).

## 1. HARD RULES — never break these; if a task would break one, stop and ask
- This is a simulated demo. Never connect to live payment rails, SWIFT, bank accounts,
  wallets, stablecoin networks, FX systems, sanctions systems, real customer data, or
  production secrets.
- The route engine is deterministic. Gemini must never select routes, score routes, override
  gates, approve execution, update state, or move money.
- Hard gates run before scoring. Compliance, sanctions, fraud, liquidity, reachability, route
  health, eligibility, route limits, wallet screening and cut-off checks are blocking controls,
  not scoring factors. Only routes that pass all blocking gates are scored.
- Decision Trace is the single source of truth for every route decision. Views and explanations
  are built from it and cannot change it.
- Gemini receives only a redacted Decision Trace and generates explanation text only. If Gemini
  is unavailable, the deterministic template explanation is used — the app never blocks on it.
- Fallback is only allowed before the point of no return. After it: servicing, investigation,
  or reconciliation only — never silent retry, never labelled "fallback".
- SWIFT gpi is not a route. The route is international bank transfer / correspondent banking.
  SWIFT is the messaging layer; gpi is tracking capability where available.
- Stablecoin has two separate patterns: stablecoin bridge + fiat payout, and wallet-to-wallet.
- Speed means time to beneficiary usable value, not first-leg confirmation.
- Tokenised securities/collateral settlement is out of scope for this demo.

## 2. ALWAYS-ON QUALITY RULES — apply to every change; cannot be switched off
- Value safety: no simulated value move may complete partially, duplicate, or go to the wrong
  destination. Prove it by test.
- Idempotency (safe to retry): every state-changing operation takes an idempotency key so
  running it again does nothing extra.
- Exception handling: map errors to stable codes (RFC 7807) and distinguish retryable vs
  terminal. Don't swallow exceptions silently.
- Audit: every important decision and state change writes an immutable, add-only event with a
  correlation id. It is never optional.
- Logging/observability: structured logs with correlation id; no secrets or sensitive data in
  logs; failures must be diagnosable from logs alone.
- Security baseline: deny by default; least privilege; no secrets in code/logs/fixtures;
  validate input at the boundary; no injection.
- Secrets & keys: this is a demo with no live secrets. The only secret is GEMINI_API_KEY,
  injected via environment variable at runtime — never committed to the repo. See 07 for the
  full policy.
- Verification & evidence — this is what stops "built but never tested":
  - Test every component: services → unit tests (including error and idempotency paths); APIs
    → integration tests; UI → automated smoke (render + key route + screenshot); each scenario
    in 05 → one end-to-end pass.
  - Show evidence: paste the real command and its real output. "Looks right" and "I'll test
    later" are not allowed.
- Rules you can switch off (with a written reason in 01): concurrency depth, data residency,
  determinism via injected time, reversibility/change-safety, SLA targets, RTO targets,
  supply-chain pinning.

## 2.5 HOW TO READ A BLANK SECTION — fill only what you need
Scope is confirmed, not guessed. Follow this order:
1. Explicit marker wins: a section marked `Scope: Used` or `Scope: Not used` is authoritative.
2. Confirm scope once at kickoff: list what you WILL and WON'T build and ask the user to
   confirm. Record the answer in STATE.md. Re-confirm only when scope changes.
3. After confirmation, a blank section = out of scope. Don't build it.
4. If a request needs a blank section, stop and ask rather than guessing.
A blank never switches off safety: the hard rules and always-on rules apply to everything
you do build. Least you need to start: 00 (mission) and one item in 03 (backlog).

## 3. HOW TO WORK — one backlog item at a time, in order (docs/agent/03-backlog.md)
0. Kickoff: read this file and docs/agent/. If STATE.md has a confirmed scope and nothing
   changed, proceed. Otherwise list what you WILL and WON'T build and ask the user to confirm.
   Record the answer in STATE.md.
1. Plan: write the success condition plus the failure cases it must handle. Check the item is
   in confirmed scope; if it needs a blank section, stop and ask first.
2. Make the smallest correct change: touch only what's needed, match the existing style, don't
   change unrelated code.
3. Write the tests as part of the work, not later (per §2 Verification).
4. Run §5 commands; paste the real command and its real output.
5. Self-check (§4), then tick the box.
6. Append to docs/agent/history.md and rewrite docs/agent/STATE.md.
Don't pause between items unless a Stop condition (§6) fires.

## 4. REVIEW
- Per item (self-check, brief, in the history entry): which §2 rules apply — each satisfied
  or not applicable with a reason? What input breaks this, and is there a test? Anything
  touched that shouldn't be — revert it. Did any Gemini path gain a decision or money-move
  capability (must be no)? Docs and STATE consistent?
- At the end of each phase: start a fresh second agent (its own clean context) to double-check
  the work. Correctness and stated requirements only — don't invent problems. Fix what affects
  correctness; note the rest as optional.

## 5. COMMANDS (how to build, test, check)
See docs/agent/02-build-plan.md for the full table. Running these must not need live external
systems or production access.

Backend:
```bash
cd backend && ./mvnw test
cd backend && ./mvnw package -DskipTests
```
Frontend:
```bash
cd frontend && npm run typecheck
cd frontend && npm test -- --run
cd frontend && npm run lint
cd frontend && npm run build
```

## 6. WHEN TO STOP AND ASK — don't guess
A hard rule (§1) would be broken · a live system or real secret would be touched · a secret
would be committed to the repo · a request needs a blank spec section (ask first — §2.5) ·
missing credentials or denied permission · build can't move forward after a fair attempt at
local debugging · an irreversible action is needed that the spec didn't allow.

## 7. STAY FOCUSED — manage what you read
- Read STATE.md (the short live summary), not the full history.
- Read just the part of a file you need. Keep changes small.
- Hand off wide searches to a helper agent; it returns a short summary.

## 8. KEEP A LOG OF WHAT YOU DID — add-only, never edited (docs/agent/history.md)
Add one entry per finished or blocked item; never rewrite an old entry:
timestamp · item · change summary · files · commands + real outputs · evidence · ADR refs ·
next item · blockers.

## References (loaded on demand)
docs/agent/00-mission.md · 01-architecture-rules.md · 02-build-plan.md · 03-backlog.md ·
04-acceptance-criteria.md · 05-scenarios.md · 06-integration-and-stack.md ·
07-security-and-secrets.md · 08-ai-model-risk.md · 09-traceability.md ·
STATE.md · history.md · adr/ · org-runbook.md (optional)
