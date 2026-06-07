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

**`publish.yml`** — triggered by a GitHub **Release** being created (`release: created`) or manual `workflow_dispatch`. Builds the library + schematics, then runs `nx release publish`. The publish step derives the npm **dist-tag from the version**: a prerelease (version containing `-`, e.g. `1.0.0-beta.0`) publishes under its prerelease identifier (`beta`/`rc`/`alpha`), a stable version publishes under `latest`. This keeps `npm i @radix-ng/primitives` resolving the stable release while a beta is in flight. Provenance is enabled (`NPM_CONFIG_PROVENANCE: true`).

**Algolia crawler** — manual dispatch only; re-crawls `https://radix-ng.com` for search index.

## Release process

Managed by `nx release` (Nx release tooling). The config lives in `nx.json` under `release` (independent versioning, project `primitives`, `conventionalCommits: false` so the version is passed explicitly, `changelog.createRelease: github`). Published to npm as `@radix-ng/primitives` with secondary entries.

**Publishing is CI-driven, not local.** The canonical flow is to run the combined command locally with an explicit version and `--skip-publish`, e.g. `npx nx release 1.0.0-beta.0 --skip-publish`. That one command builds primitives, bumps the version + CHANGELOG, commits, tags (`primitives@<version>`), **pushes to origin**, and **creates the GitHub Release** — all before any publish. Creating the Release fires `publish.yml`, which performs the actual npm publish (with the version-derived dist-tag). `--skip-publish` is required so the library is published only by CI, never twice.

Notes:

- The standalone `nx release version` / `nx release changelog` subcommands fail in this repo because `nx.json` sets the top-level `release.git`; only the combined `nx release` command works.
- Creating the GitHub Release needs local GitHub auth (`GITHUB_TOKEN`/`GH_TOKEN` env or `gh auth`); without it the Release step fails and CI is never triggered.
- For prereleases, mark the GitHub Release as **Pre-release** (not "Latest") so the repo's latest-release pointer stays on the stable version. Install a prerelease explicitly: `npm i @radix-ng/primitives@beta`.
- `pnpm release:dry-run` previews version bumps and release notes; `pnpm release:primitives` cuts version + changelog without publishing.
- Current version: `1.0.0-beta.0` (first `1.0.0` prerelease; previous stable line was `0.51.0`).

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
