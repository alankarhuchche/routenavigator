# Backlog

Phase 1 overall status: Complete. Payment Route Intelligence Phase 1 was deployed successfully from commit `053f9ce`.

| Phase | Title | Status | Scope | Notes |
| --- | --- | --- | --- | --- |
| 1A | Trusted session | Done | Frontend | Trusted session banner, outcome-led input, mocked Speak button, demo scenarios demoted. |
| 1B | Intent confirmation | Done | Frontend | Intent Confirmation Card before route analysis. |
| 1C | Route intelligence panel | Done | Frontend | Deterministic controls, analysis lanes and route metrics. |
| 1D | Recommendation hero | Done | Frontend | Customer-facing recommended route summary. |
| 1E | Journey shell | Done | Frontend | Renamed flow to Secure Intent / Route Intelligence / Approval & Tracking. |
| 1F | Payment journey map | Done | Frontend | Representative map with journey nodes, controls, finality/PONR and alternatives. |
| 1F-fix | Map clarity | Done | Frontend | Numbered nodes, safety line, recommended route dominance. |
| 1G | Agent context gateway | Done | Frontend | Mocked advice-only agent governance/evidence drawer. |
| 1H | Final approval screen polish | Done | Frontend | Final approval card, approval boundary, secondary simulation controls. |
| 1I | End-to-end QA and copy safety pass | Done | Frontend/docs QA | Verified journey framing, safety copy and build/test status. |
| 1J | Claude-ready handoff pack | Done | Docs | Repo-local context for Claude or another AI assistant to continue without chat history. |
| 1K | Deployment readiness and Cloud Run deploy | Done | Git/deployment | Verified production build packaging; GitHub push triggered Cloud Build / Cloud Run deployment. |
| 1M | Deployment close-out and Phase 1 completion record | Done | Docs | Recorded successful deployment and marked Phase 1 complete. |
| 2A | Harness automation improvements | Done | Docs/scripts | Added workflow docs, checklist template, review rubric and safe helper scripts. |
| 2A.1 | Program execution harness | Done | Docs/scripts | Added repo-owned brief, phase plan, execution state, gates and phase files for controlled AI execution. |
| 2B | Extract payment journey adapter from LeafletRouteMap | Done | Frontend refactor | Moved journey derivation into a pure adapter with focused tests. |
| 2C | Route data alignment frontend/backend | Done | Frontend/backend data | Inventory found frontend scenarios 7-11 need route-logic/product-scope approval before backend alignment. |
| 2C-fix | Static corridor demo labelling | Done | Frontend/docs | Kept scenarios 7-11 as illustrative frontend-only corridor demos; backend corridor support remains deferred. |
| 2D | Approval step transition cleanup | Done | Frontend | Added a clearer approval handoff and Approval & Tracking framing. |
| 2E | Regression QA and release decision | Done | QA | Frontend and backend checks pass; ready for human-approved push/release gate. |
| Release gate | Human-approved push/deploy decision | Done | Git/deployment | Phase 2 release candidate was pushed to GitHub. |
| 3A | Demo journey shell / page-like wizard | Done | Frontend/docs | Split the demo into Secure Intent, Route Intelligence, Journey & Controls, and Approval & Tracking stages. |
| 3A-fix | Page-like stage and map regression fix | Done | Frontend/docs | Made the active stage feel exclusive/page-like and restored Journey & Controls map visibility after local demo review. |
| 3B | Voice intent and Gemini route explanation demo | Done | Frontend/demo | Added browser voice intent capture, trusted agent explanation panel and read-aloud without changing route decisions. |
| 3B-fix | Secure Intent repair and premium polish | Done | Frontend/docs | Fixed typed intent persistence/progression, restored visible voice affordance and reworked Secure Intent into a premium composer layout. |
| 3 UX-fix | Split Secure Session and Intent Capture | Done | Frontend/docs | Split the opening experience into Secure Session and Intent Capture stages while preserving route intelligence, journey controls and approval behaviour. |
| 3 UX-fix 2 | Premium Secure Session landing screen | Done | Frontend/docs | Redesigned Stage 1 as a premium secure-session opening with visible CTA, readiness sequence and no initial route/debug summary. |
| 3 UX-fix 3 | Restore visible Secure Session runtime render | Done | Frontend/docs | Added root render fallback and focused visibility coverage after a local blank-page report; Stage 1 is visible in fresh runtime smoke checks. |
| 3D | Voice/text to structured intent and explanation readiness | Done | Frontend/backend/docs | Wired transcript/text through intent structuring with Gemini/rules fallback, customer review confirmation and bounded route explanation readiness. |
| 3C | Demo launch pack and walkthrough | Next | Docs/demo | Prepare demo script, walkthrough checklist and launch handoff. |
