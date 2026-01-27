# Repository Guidelines

## Project Structure & Module Organization
- `src/app/(frontend)` is the App Router entry; `[slug]/page.tsx` fetches Payload pages while `login`, `posts`, etc. sit beside it.  
- `src/app/(payload)` customizes the admin shell; `src/blocks`, `src/collections`, `src/components`, `src/fields`, and `src/hooks` define block UI and Payload schemas, with helpers in `src/lib` and `src/utilities`.  
- Generated types live in `src/payload-types.ts`, global config in `payload.config.ts`, and static assets/Tailwind overrides live in `public` plus `src/app/(frontend)/tailwind.css`.

## Build, Test, and Development Commands
- `npm run dev` (or `npm run devsafe` to clear `.next`) launches Payload + Next with draft mode; point the browser to `http://localhost:3000`.  
- `npm run build` compiles production assets and Payload endpoints, and `npm run start` serves the result.  
- `npm run lint` enforces ESLint; run it together with `npm run generate:types`/`npm run generate:importmap` after editing collections.  
- `npm run payload <cmd>` lets you invoke the Payload CLI, and `docker-compose up -d` spins up MongoDB plus a pnpm-based dev container if you prefer not to install Node locally.

## Coding Style & Naming Conventions
- TypeScript is strict with the `@/*` alias; prefer named imports from module roots instead of relative ladders.  
- The ESLint config extends `next/core-web-vitals`; prefix intentionally unused args with `_` to satisfy the no-unused-vars rule.  
- Prettier enforces 2-space indent, single quotes, trailing commas, and no semicolons—run `npx prettier --write "src/**/*.{ts,tsx}"` before committing.  
- Components, blocks, and collections use PascalCase filenames; shared utilities use lowerCamelCase.

## Testing Guidelines
- No automated runner exists yet, so rely on `npm run lint` plus manual regression sweeps in `npm run dev`.  
- When you add logic-heavy utilities or hooks, include colocated `*.test.ts` files (Next.js supports `next/jest`) or document a repeatable QA script inside the PR.

## Commit & Pull Request Guidelines
- Follow the repo’s Conventional Commits (`feat:`, `refactor(SitesBlock):`, etc.); scopes should match the folder you touched.  
- Each PR needs a summary, list of affected routes/collections, screenshots for UI changes, and notes on any env tweaks or migration steps; verify lint passes before requesting review.

## Security & Configuration Tips
- Copy `.env.example` to `.env`, set `DATABASE_URI` (host `mongo` when using Docker) and `PAYLOAD_SECRET`, and exclude the file from commits.  
- Keep secrets in env vars accessed from server-only modules, and store bulky uploads in `public/media` or external storage referenced by Payload fields.

## Connect DB in Coolify

mongosh "mongodb://root:dnwr9jdERGncuzHxuQ3KSdWQD1NP4blRaYaQkZnk9EwOJMPOZIPPZZCYM2cEPCZL@kg0kgcgg08k0soog4o0kkkkw:27017/test?authSource=admin&directConnection=true"

mongodump \
--uri="mongodb://root:dnwr9jdERGncuzHxuQ3KSdWQD1NP4blRaYaQkZnk9EwOJMPOZIPPZZCYM2cEPCZL@kg0kgcgg08k0soog4o0kkkkw:27017/test?authSource=admin&directConnection=true" \
--archive=/tmp/test.archive.gz \
--gzip

docker cp <mongo_container_name>:/tmp/test.archive.gz ./test.archive.gz