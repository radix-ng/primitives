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
2. `lint` — prettier check + stylelint + eslint (all `--max-warnings=0`). The same `--max-warnings=0` eslint/stylelint run is also wired into the **pre-commit hook** (husky + lint-staged), so a `warn` behaves like an `error` locally and in CI — see the "Linting — zero-warning policy" gotchas in patterns.md before touching lint config.
3. `unit` — `pnpm primitives:test` (Vitest)
4. `builds` — `pnpm primitives:build` + `pnpm primitives:build:schematics`
5. `skills` — regenerates the LLM skills bundle (`pnpm skills:build`) and fails if the committed output drifts from the Storybook docs, keeping the bundle in sync (see architecture.md)
6. `summary` — gate job; fails if any of lint/unit/builds/skills fails

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
- Current version: `1.0.x` stable, published under the `latest` dist-tag (the `1.0.0` line succeeded the previous stable `0.51.0`; source of truth is `packages/primitives/package.json`).

## Storybook — also the public site

Storybook now serves the public documentation site on the main domain `https://radix-ng.com`.

- **Dev:** `pnpm storybook:primitives` → `http://localhost:4400`
- **Build check:** `nx run radix-storybook:build-storybook` (add `--skip-nx-cache` to force rebuild)
- **Static serve:** `pnpm static-storybook`
- **Output:** `dist/radix-storybook/`
- **LLM endpoints:** the generated skills bundle is served as static files via `staticDirs` (`apps/radix-storybook/.storybook/main.ts`), so `/llms.txt`, `/llms-full.txt`, and `/<section>/<slug>.md` are available on the main domain. Source: `skills/radix-ng-examples/references/` (see LLM consumer skills below and architecture.md).

## LLM consumer skills

`pnpm skills:build` regenerates the Agent Skills bundle under `skills/` from the Storybook docs (generator in `tools/scripts/skills/`). Run it after changing any `*.docs.mdx`. The output is committed, CI-verified (the `skills` job above), and excluded from Prettier via `.prettierignore` so it isn't reformatted into drift. Contents and architecture: see architecture.md. Published via skills.sh: `npx skills add radix-ng/primitives/skills`.

## SSR testing app

- **Serve:** `pnpm primitives:ssr:serve`
- **Build:** `pnpm primitives:ssr:build`
- **Run built server:** `pnpm primitives:ssr:dist`
- Used for smoke-testing that primitives work under Angular SSR

## Playground app

- **Serve:** `pnpm playground`
- **Build:** `pnpm playground:build`
- Used for manual Angular integration checks outside Storybook

## Performance testing app

- **Run:** `pnpm primitives:bench`
- Used for focused Vitest-backed performance benchmarks

## Visual regression app

- **Run:** `pnpm test-visual`
- **Update baselines:** `pnpm test-visual:update`
- **Report:** `pnpm test-visual:report`
- Playwright specs live under `apps/visual-regression/tests/` and run against the built Storybook.

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
