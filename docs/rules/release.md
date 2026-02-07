# Release And PR Rules

## Required
- PR title and commits must follow Conventional Commits.
- PR description must include:
  - what changed
  - why it changed
  - affected routes/collections/blocks
  - screenshots for UI changes
  - env or migration notes
- Before review, ensure required checks pass:
  - `npm run lint`
  - `npm run generate:types` and `npm run generate:importmap` when schema changed
- Do not merge if known blockers remain undocumented.

## Recommended
- Run `npm run build` before merging high-impact changes.
- Keep PRs focused; split unrelated changes into separate PRs.
- Add a rollback note for risky schema/content migrations.

## Examples
- Good commit:
  - `feat(Blocks): add PromoGrid variant with CTA validation`
- Good PR checklist item:
  - "Verified preview and publish for updated Pages collection fields."
