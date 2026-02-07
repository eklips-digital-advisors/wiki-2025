# Repository Rules

This file is the top-level policy for contributors and agents.  
Detailed domain rules live in `docs/rules/`.

## Required
- All code and content changes must follow the domain rules in `docs/rules/*.md`.
- Follow Conventional Commits (`feat:`, `fix:`, `refactor(scope):`).
- Run `npm run lint` before opening a PR.
- If you changed Payload schema/collections, run both:
  - `npm run generate:types`
  - `npm run generate:importmap`
- Keep TypeScript strict and use the `@/*` alias instead of deep relative imports.
- Do not commit secrets (`.env`, credentials, private keys, tokens).
- PRs must include:
  - Summary of changes
  - Affected routes, blocks, or collections
  - Screenshots for UI changes
  - Any env or migration notes

## Recommended
- Run `npm run build` locally for risky or cross-cutting changes.
- Do manual regression checks in `npm run dev` for changed user flows.
- Add or update colocated tests for logic-heavy utilities/hooks.

## Rule Map
- Frontend: `docs/rules/frontend.md`
- Payload collections: `docs/rules/payload-collections.md`
- Payload official references: `docs/rules/payload-official/`
- Blocks: `docs/rules/blocks.md`
- Testing: `docs/rules/testing.md`
- Release and PR quality gate: `docs/rules/release.md`
