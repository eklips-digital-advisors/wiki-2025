# Frontend Rules

## Required
- Keep route code in `src/app/(frontend)` and shared UI in `src/components`.
- Use TypeScript with explicit props types for exported components.
- Keep imports clean with the `@/*` alias and avoid deep relative import chains.
- Keep Tailwind changes centralized in `src/app/(frontend)/tailwind.css` when global.
- When possible, use existing shadcn/ui components from `@/components/ui` before creating custom primitives.
- Preserve accessibility basics: labels for form controls, alt text for images, keyboard reachable controls.

## Recommended
- Keep page-level components focused; move reusable UI and data shaping to dedicated components/utilities.
- Prefer server components by default; use client components only when interactivity requires it.
- Add loading and empty states where a page depends on async data.
- Keep class naming/style decisions consistent with existing patterns in nearby files.
- If a needed primitive does not exist yet, add it from shadcn/ui: `https://ui.shadcn.com/docs/components`.

## Examples
- New route page:
  - `src/app/(frontend)/about/page.tsx`
- Shared card used by multiple pages:
  - `src/components/cards/PageCard.tsx`
- Global Tailwind token override:
  - `src/app/(frontend)/tailwind.css`
