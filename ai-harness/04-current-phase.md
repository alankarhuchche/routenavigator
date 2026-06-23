# Current Phase

Phase 2D — Approval step transition cleanup

Execution mode: use `ai-harness/program/execution-state.md` and run `bash scripts/ai-program-next.sh` before starting this phase.

## Objective

Make Approval & Tracking feel like a clearer customer step without changing backend behavior, route decision logic, deployment files or API contracts.

## Expected Scope

- Frontend approval/tracking components and styling only.
- Preserve final approval boundary: no money moves until customer approval.
- Keep agent unable to approve or move money.
- Keep internal simulator controls secondary.
- Do not add real passkeys, biometrics, execution rails or payment integrations.
- Do not change backend, route decision logic, deployment files or API contracts.
- Do not add dependencies.
- Do not deploy.

## Files Likely to Inspect

- `ai-harness/README.md`
- `ai-harness/09-handoff-to-ai.md`
- `ai-harness/03-backlog.md`
- `ai-harness/04-current-phase.md`
- `ai-harness/05-acceptance-criteria-template.md`
- `ai-harness/06-codex-task-template.md`
- `ai-harness/11-open-risks.md`
- `ai-harness/12-next-prompts.md`
- `ai-harness/13-ai-engineering-workflow.md`
- `frontend/src/App.tsx`
- `frontend/src/components/FinalApprovalCard.tsx`
- `frontend/src/components/PaymentTracker.tsx`
- `frontend/src/components/ControlRoom.tsx`
- `frontend/src/App.css`
- frontend tests

## Key Risks

- Making the approval step look like autonomous execution.
- Making internal simulator controls look like customer actions.
- Weakening agent/payment safety wording.
- Accidentally changing route analysis or backend behavior.

## Acceptance Criteria Summary

- Approval & Tracking is visually and narratively distinct.
- Customer approval remains explicit and mocked where appropriate.
- Agent cannot approve or move money.
- Existing simulator/tracker behavior remains available.
- Frontend checks pass.
- No backend, deployment or API contract changes.
- No dependencies are added.

## Expected Outputs

- Files inspected.
- Files changed.
- Journey transition summary.
- Commands run and results.
- Acceptance criteria result.
- Risks/follow-up.
