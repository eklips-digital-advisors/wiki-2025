# Block Rules

## Required
- Keep each block in its own folder under `src/blocks/<BlockName>`.
- Export a typed block config and a matching render component contract.
- Keep block field names stable after release; if renaming is necessary, provide safe migration handling.
- Avoid embedding unrelated business logic directly in block render components.
- Validate required block content in schema definitions rather than only in UI.

## Recommended
- Add a short `README.md` in block folders for complex blocks:
  - expected data shape
  - rendering constraints
  - editor guidance
- Reuse shared UI/field helpers instead of duplicating block-local implementations.
- Keep block props narrow and map raw Payload data to render-safe structures.

## Examples
- Block config:
  - `src/blocks/Hero/config.ts`
- Block component:
  - `src/blocks/Hero/Component.tsx`
- Block docs:
  - `src/blocks/Hero/README.md`

## SitesBlock Details

### Purpose
- `SitesBlock` renders an operational overview table for site health, stack versions, integrations, and performance.
- Block config is minimal (`title` only) and most data is computed at render time from Payload + external providers.

### Source Files
- `src/blocks/SitesBlock/config.ts`
- `src/blocks/SitesBlock/Component.tsx`
- `src/blocks/SitesBlock/Component.client.tsx`
- `src/blocks/SitesBlock/sites-types.ts`
- `src/blocks/SitesBlock/Columns.ts`

### Data Flow
- Server component (`Component.tsx`) fetches:
  - Payload collection `sites`
  - Cloudflare zone/stats/SSL data
  - Pingdom uptime and host data
  - WordPress latest version API
  - PHP support API
  - Repository metadata from Beanstalk/Azure DevOps
  - Provider detection on production URLs (analytics/cookie/data providers)
- Server output is normalized into `SiteItem[]` plus `extraInfo`.
- Client component (`Component.client.tsx`) handles search, sorting, visible columns, row virtualization, and revalidation trigger.

### Data Contract
- `SiteItem` in `sites-types.ts` is the contract between server and client.
- If adding/removing table fields, update all of:
  - `SiteItem` type
  - `Columns.ts` key definitions
  - `renderCell` switch in `Component.client.tsx`
  - export logic (`exportToExcel`) if column should be included
- Keep nullable fields explicit (`null` or empty string) to avoid client-side sort/render edge cases.

### Interaction Rules
- Manual refresh uses `POST /next/revalidate` with `path: '/sites'`.
- Cloudflare percentage sorting uses bandwidth values, not raw string rendering.
- Date sorting expects `dd.mm.yyyy` format and uses `parseDateUTC`.
- Large table rendering uses `@tanstack/react-virtual`; avoid introducing row layouts that break estimated row height assumptions.

### Extension Checklist
- Add new per-site async providers in the server component with concurrency control (`p-limit`) when endpoint volume is high.
- Default all new provider results to safe fallback values so one failed source does not crash a site row.
- Keep external link generation defensive (missing ids/hostnames should render empty state, not broken links).

## PlanningBlock Details

### Purpose
- `PlanningBlock` (referred to as "PlanninBlock" in some notes) is a scheduling interface built on `FullCalendar` resource timeline views.
- Supports two planning modes:
  - regular mode: people as resources with project allocations
  - inverted mode: projects as resources with user/status allocations

### Source Files
- `src/blocks/PlanningBlock/config.ts`
- `src/blocks/PlanningBlock/Component.tsx`
- `src/blocks/PlanningBlock/Component.client.tsx`
- `src/blocks/PlanningBlock/utils/regular/*`
- `src/blocks/PlanningBlock/utils/inverted/*`
- `src/blocks/PlanningBlock/modals/*`
- `src/blocks/PlanningBlock/TeamworkTasksDropdown.tsx`

### Data Flow
- Server component fetches:
  - `users` where `includeInPlanningTool = true` (sorted by `position`)
  - `projects`
  - `time-entries`
  - `status-time-entries`
  - Teamwork events (`GetTeamworkEvents`)
- Client component derives:
  - resources (`generateResources` or `generateInvertedResources`)
  - events (`getProjectEvents`, weekly summary events, inverted events, teamwork-inverted events)
  - role-based filtering and mode-specific views

### Interaction And Write Rules
- Calendar interactions (`eventClick`, `select`, `eventDrop`, `eventResize`) dispatch to mode-specific handlers in `utils/regular` or `utils/inverted`.
- Most mutation handlers call `POST /next/revalidate` with `path: '/planning'`.
- UI actions that mutate data must require an authenticated frontend user (`getFrontendUser` + guard checks).
- Keep behavior parity across both modes when introducing new scheduling actions.

### Teamwork Task Dropdown Contract
- `TeamworkTasksDropdown` loads open tasks via `GET /next/get-project-open-tasks?id=<teamworkProjectId>`.
- Route normalizes heterogeneous Teamwork payload shapes and filters completed tasks.
- Expected task payload fields:
  - `id`
  - `name`
  - `url`
  - `listName`
  - `assignees`
  - `createdAt`
- If route response shape changes, update dropdown parsing and fallback handling together.

### Revalidation And Consistency
- Collection-level hook exists at `src/blocks/PlanningBlock/hooks/revalidatePlanning.ts` and revalidates `/planning`.
- Keep route-level revalidation calls and collection hooks aligned to prevent stale timeline views.
- When adding new planning mutations, ensure both local state update and revalidation happen.

### Extension Checklist
- When adding a new event/resource type:
  - update regular mode generators
  - update inverted mode generators
  - update drag/resize handlers
  - update resource label rendering (`getResourceLabelContent`)
- Keep timezone behavior explicit (`UTC` in calendar config) and format all displayed dates consistently.
- Keep modal slugs centralized and unique to avoid collisions across planning actions.
