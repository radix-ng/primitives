# Builds, CI and releases

## Current configuration

Read configuration for current versions, commands and job options rather than maintaining another copy here.

| Question                                                   | Source                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Development tools, dependency versions and package scripts | [Root package.json](../../package.json)                                             |
| Node selection and supported runtime range                 | [.nvmrc](../../.nvmrc) and root manifest `engines`                                  |
| Library version, Angular compatibility and runtime peers   | [Library package.json](../../packages/primitives/package.json)                      |
| Build/release dependencies and release actions             | [nx.json](../../nx.json), [library targets](../../packages/primitives/project.json) |
| CI commands, required gates, platforms and matrices        | [CI workflow](../../.github/workflows/ci.yml)                                       |
| Dependency installation and Node setup in CI               | [Shared setup action](../../.github/actions/setup/action.yml)                       |

## CI responsibilities

CI checks formatting/lint, affected unit tests, builds and consumer template types. The SSR app participates in affected tests/builds. Contributor setup and the generated consumer bundle have their own checks; see [agent setup](agent-setup.md) and [consumer skills](consumer-skills.md).

Browser coverage is selected from changed primitive/story imports by the [affected planner](../../tools/playwright/affected.ts). Shared infrastructure, unknown changes and missing history select broad coverage. Pinned comparisons and Storybook regressions have separate jobs; their aggregate preserves the required gate when the selection is empty. Use the workflow for the current job names and engine/platform matrix, and the [comparison README](../../apps/parity-testing/README.md) for local invocation and evidence.

The [Chromatic workflow](../../.github/workflows/chromatic.yml) publishes visual changes for review. Its configured change-handling policy determines whether differences fail a run; review the dashboard for actual visual changes.

## Release process

Releases use Nx. Read `release` in [nx.json](../../nx.json) for project selection, version actions, changelog generation and Git/GitHub behavior. The current repository version comes from the library manifest; release history lives in [CHANGELOG.md](../../packages/primitives/CHANGELOG.md).

Use the combined `nx release <version> --skip-publish` flow with an explicit intended version. The repository's release configuration spans versioning, changelog and Git actions; those steps belong to the combined command. Keep `--skip-publish` so the local command prepares the release while npm publication remains CI-driven. The root manifest contains the dry-run and release script aliases.

Creating a GitHub Release triggers the [publish workflow](../../.github/workflows/publish.yml), which builds the library and schematics before publishing. The workflow derives the npm dist-tag from the package version: prerelease identifiers receive their corresponding tag; stable releases use `latest`. It also configures npm provenance. Mark a prerelease GitHub Release as **Pre-release** rather than **Latest**.

Local GitHub Release creation needs GitHub authentication (`GITHUB_TOKEN` / `GH_TOKEN` or `gh auth`). Review the configured release actions when preparing a release; generating version notes and publishing are distinct steps.

## Applications and documentation

Use script aliases from the root manifest and target options from the owning project file.

| Area                    | Purpose and configuration                                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storybook / public docs | [Storybook targets](../../apps/radix-storybook/project.json) define the dev port, output directory and static serving. [main.ts](../../apps/radix-storybook/.storybook/main.ts) configures the generated LLM routes. |
| SSR consumer            | [SSR targets](../../apps/radix-ssr-testing/project.json) and render specs exercise server rendering, hydration and public-template compatibility.                                                                    |
| Playground              | [Playground targets](../../apps/radix-playground/project.json) support manual consumer integration checks.                                                                                                           |
| Performance             | [Benchmark project](../../apps/radix-perf-testing/project.json) and the [performance handbook](../../apps/radix-storybook/docs/guides/performance.docs.mdx) describe real-browser measurements.                      |
| Browser regression      | [Visual regression README](../../apps/visual-regression/README.md) describes behavior checks, screenshots, baseline updates and reports.                                                                             |
| API documentation       | [TypeDoc builder](../../tools/scripts/api-doc/build.mjs) defines API-doc generation.                                                                                                                                 |

The composed site mounts Storybook at `https://radix-ng.com/docs/`. Its static generated bundle supplies `llms.txt`, `llms-full.txt`, per-page Markdown and per-primitive JSON contracts relative to that base; offline consumer skills use the same content. See [the consumer pipeline](consumer-skills.md) for generation triggers and integrity checks.

## Environment variables and monitoring

| Secret                              | Purpose                          |
| ----------------------------------- | -------------------------------- |
| `CHROMATIC_PROJECT_TOKEN`           | Chromatic visual regression      |
| `ALGOLIA_DOCSEARCH_CRAWLER_USER_ID` | Algolia crawler                  |
| `ALGOLIA_DOCSEARCH_CRAWLER_API_KEY` | Algolia crawler                  |
| `ALGOLIA_DOCSEARCH_API_KEY`         | Search on the documentation site |

The [Algolia crawler workflow](../../.github/workflows/algolia-docsearch-crawler.yml) runs on manual dispatch. Visual regressions are reviewed in Chromatic. This is a library and static documentation site, so there is no library application server to monitor.
