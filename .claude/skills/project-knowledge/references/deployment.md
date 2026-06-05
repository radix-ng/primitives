---
name: deployment
description: CI/CD pipeline, release process, Storybook/docs publishing, and monitoring for Radix NG
metadata:
  type: project
---

# Deployment

## CI/CD — GitHub Actions

All workflows are in `.github/workflows/`.

**`ci.yml`** — runs on every push to `main` and on PRs:

1. `install-deps` — checkout + setup (`.github/actions/setup`)
2. `lint` — prettier check + stylelint + eslint (all `--max-warnings=0`)
3. `unit` — `pnpm primitives:test` (Vitest)
4. `builds` — `pnpm primitives:build` + `pnpm primitives:build:schematics`
5. `summary` — gate job; fails if any of lint/unit/builds fails

**`chromatic.yml`** — visual regression on push to `main` via Chromaui action. `exitZeroOnChanges: true` — changes are flagged but don't fail the build; review happens in Chromatic dashboard.

**Algolia crawler** — manual dispatch only; re-crawls `https://radix-ng.com` for search index.

## Release process

Managed by `nx release` (Nx release tooling). Run `pnpm release:dry-run` to preview version bumps and release notes; `pnpm release:primitives` to cut a library release without publishing. Published to npm as `@radix-ng/primitives` with secondary entries. Current version: `0.51.0`.

## Storybook

- **Dev:** `pnpm storybook:primitives` → `http://localhost:4400`
- **Build check:** `nx run radix-storybook:build-storybook` (add `--skip-nx-cache` to force rebuild)
- **Static serve:** `pnpm static-storybook`
- **Output:** `dist/radix-storybook/`

## Docs site (`radix-docs`)

- **Dev:** `pnpm radix-docs:dev`
- **Build:** `pnpm radix-docs:build`
- **Output:** `dist/radix-docs/`
- **Public site:** `https://radix-ng.com`
- LLM endpoints: `/llms.txt` and `/primitives/<section>/<slug>.md` (static Astro routes built from Storybook MDX)

## SSR testing app

- **Serve:** `pnpm primitives:ssr:serve`
- **Build:** `pnpm primitives:ssr:build`
- **Run built server:** `pnpm primitives:ssr:dist`
- Used for smoke-testing that primitives work under Angular SSR

## TypeDoc API reference

`pnpm primitives:build:typedoc` — generates API docs via `tools/scripts/api-doc/build.mjs`

## Environment variables (CI secrets)

| Secret                              | Used by                     |
| ----------------------------------- | --------------------------- |
| `CHROMATIC_PROJECT_TOKEN`           | Chromatic visual regression |
| `ALGOLIA_DOCSEARCH_CRAWLER_USER_ID` | Algolia crawler             |
| `ALGOLIA_DOCSEARCH_CRAWLER_API_KEY` | Algolia crawler             |
| `ALGOLIA_DOCSEARCH_API_KEY`         | Algolia search on docs site |

## Monitoring

- Visual regressions: Chromatic dashboard (triggered on each `main` push)
- Search: Algolia DocSearch (manually triggered crawler)
- No application server monitoring (it's a library, not a running service)
