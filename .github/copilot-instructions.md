<!-- Short, targeted guidance for AI coding agents working in this repo -->
# Copilot / Agent Instructions

Purpose: Give AI coding agents the minimal, high-value context to be productive immediately in this monorepo.

- Big picture:
  - **Services**: `apps/api` (backend API), `apps/analyzer` (analysis service), `apps/web` (frontend), `worker` (background jobs). See root layout in [package.json](package.json).
  - **Infra**: Local orchestration via [infra/docker-compose.yml](infra/docker-compose.yml). The API connects to a Postgres DB using `DATABASE_URL` (see `apps/api/src/config/db.ts`).
  - **Data flow**: Clients -> `apps/web` -> `apps/api` -> DB / `apps/analyzer` / `worker` as async jobs.

- Key places to look (examples):
  - API DB config: [apps/api/src/config/db.ts](apps/api/src/config/db.ts#L1-L8)
  - API server entry points: [apps/api/src/app.ts](apps/api/src/app.ts) and [apps/api/src/server.ts](apps/api/src/server.ts)
  - Route and middleware pattern: [apps/api/src/middleware/routes](apps/api/src/middleware/routes)
  - Domain modules layout: [apps/api/src/modules](apps/api/src/modules) (features under their own folders)
  - Note: one module folder name contains a typo `plarform-invites` — be careful if you refactor.

- Project conventions and patterns:
  - TypeScript monorepo style: code lives under `apps/` and shared code under `packages/`.
  - Modules are feature-scoped: add new feature code under `apps/api/src/modules/<feature>` and follow existing export patterns.
  - Middleware and routes are registered centrally under `apps/api/src/middleware/*` — update there when adding endpoints.
  - Env-first configuration: runtime values come from environment variables (e.g., `DATABASE_URL`). Prefer reading `package.json` and `infra/docker-compose.yml` for common env setups.

- Integration points & dependencies to watch:
  - Postgres: configured in `apps/api/src/config/db.ts` and expected as `DATABASE_URL` in env or compose.
  - Inter-service communication: services interact via HTTP and background jobs (check `worker` and `apps/analyzer` code for queue patterns).
  - Docker compose defines service names and network used for local integration — use those names when creating compose-based envs.

- Developer workflows (what agents should check first):
  - Inspect `package.json` scripts at repository root to discover build/test commands: [package.json](package.json).
  - Use `infra/docker-compose.yml` for local integration testing of DB and multiple services.
  - When changing API contracts, update corresponding modules under `apps/api/src/modules` and route registrations under `middleware`.

- Guidance for generating code changes:
  - Be conservative: follow existing folder and naming conventions exactly (including the `plarform-invites` name) unless the user asks to rename.
  - Give concrete file edits and include file links in PR descriptions (reference the specific files you changed).
  - When you modify runtime configuration, list the env variables changed and update `infra/docker-compose.yml` if needed.

- When in doubt:
  - Run a quick grep for similar patterns under `apps/api/src/modules` and `apps/api/src/middleware` to mirror existing implementations.
  - Ask the developer before renaming folders, changing service boundaries, or altering docker-compose service names.

Please review and tell me if you'd like more details (scripts, common commands, or examples of typical PR descriptions).
