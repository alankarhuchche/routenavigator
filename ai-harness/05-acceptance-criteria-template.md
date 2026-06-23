# Acceptance Criteria Template

Use this inside every future Codex prompt.

## Product Acceptance

- [ ] The requested user/product outcome is visible and understandable.
- [ ] The change fits the Payment Route Intelligence journey.
- [ ] Existing customer journey functionality remains available.
- [ ] Demo concepts are clearly labelled when mocked or representative.

## Safety Acceptance

- [ ] GenAI does not choose routes, approve execution or move money.
- [ ] Trusted agent remains advice-only.
- [ ] Customer final approval is required before execution.
- [ ] No copy implies money moved before approval.
- [ ] No copy implies guaranteed settlement or guaranteed atomicity.
- [ ] Map/context/MCP/passkey/voice concepts are mocked unless explicitly scoped otherwise.

## Technical Acceptance

- [ ] Scope boundaries were followed.
- [ ] No backend changes unless explicitly scoped.
- [ ] No route decision logic changes unless explicitly scoped.
- [ ] No deployment changes unless explicitly scoped.
- [ ] No package dependencies added unless explicitly approved.

## Regression Acceptance

- [ ] Existing route comparison remains available.
- [ ] Existing decision trace remains available.
- [ ] Existing map remains available.
- [ ] Existing approval, tracker and simulator behavior remains available.
- [ ] Relevant lint/typecheck/build/test commands pass when app files change.

## Output / Reporting Acceptance

- [ ] Files changed are listed.
- [ ] Commands run and results are listed.
- [ ] Acceptance criteria pass/fail is reported.
- [ ] Scope deviations are reported.
- [ ] Risks/follow-ups are listed.

