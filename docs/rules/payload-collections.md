# Payload Collection Rules

## Required
- Define collections in `src/collections` with clear field names and admin labels.
- After collection/schema changes, run:
  - `npm run generate:types`
  - `npm run generate:importmap`
- Keep validation rules near fields (required, min/max, relationship constraints).
- Use hooks only when field-level config cannot enforce the behavior.
- Ensure access rules are explicit for read/create/update/delete where needed.

## Recommended
- Keep collection configs small by extracting repeated field groups into reusable modules.
- Document non-obvious business constraints in a short comment above the relevant field/hook.
- Prefer deterministic slug and relationship behavior to reduce admin-side surprises.

## Examples
- Collection definition:
  - `src/collections/Pages.ts`
- Shared field builder:
  - `src/fields/slug/index.ts`
- Related helper:
  - `src/utilities/formatSlug.ts`
