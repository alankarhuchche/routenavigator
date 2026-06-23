# Review Template

Use this for Codex or another reviewer before committing or deploying.

## Task

Review the current diff for `<phase/title>`.

## Review Instructions

1. Inspect `git status --short --branch`.
2. Inspect the relevant diff.
3. Check whether changes are inside the requested scope.
4. Check acceptance criteria from the original prompt.
5. Check unsafe wording:
   - AI/Gemini selecting routes
   - agent approving/executing/amending/cancelling/moving money
   - money moved before approval
   - guaranteed settlement
   - guaranteed atomicity
   - live telemetry or real bank integration when only mocked/demo data exists
6. Check test/build commands and results.
7. Identify missing tests or fragile behavior.

## Output Format

- Highest-severity findings first.
- For each finding include severity, path, issue, impact and concrete fix.
- Then provide:
  - scope result
  - acceptance criteria result
  - test/build result
  - recommendation: keep / rework / revert

Do not make broad refactors during review unless directly needed to fix a clear issue.

