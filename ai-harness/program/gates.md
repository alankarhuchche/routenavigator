# Human Approval Gates

Human approval is required before:

- push
- deploy
- dependency addition
- backend API contract change
- route decision logic change
- product scope expansion
- new integration
- moving from regression QA to release

AI may proceed without human approval only inside the current approved phase when acceptance criteria are clear and no gate above is crossed.

If a task needs to cross a gate, stop and report:

- what gate is involved
- why the gate is needed
- what files or systems would be affected
- what exact approval is required
