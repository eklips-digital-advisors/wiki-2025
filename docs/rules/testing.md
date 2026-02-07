# Testing Rules

## Required
- Run `npm run lint` for every change.
- Manually verify affected flows in `npm run dev` when UI or content behavior changes.
- For logic-heavy utilities/hooks, add colocated tests (`*.test.ts`) or document a repeatable QA script in the PR.
- Note edge cases tested when a bug fix depends on specific input/state combinations.

## Recommended
- Add regression checks for fixed bugs to prevent repeat failures.
- Favor small, deterministic tests for pure utilities.
- Keep manual QA scripts concise and runnable by another developer without extra context.

## Examples
- Utility test:
  - `src/utilities/formatSlug.test.ts`
- Hook test:
  - `src/hooks/usePreviewMode.test.ts`
- Manual QA section in PR:
  - "Open `/posts`, create draft page, verify preview + publish behavior."
