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
| npm publication and production documentation deployment    | [Publish workflow](../../.github/workflows/publish.yml)                             |
| Site build, output, Git deployment policy and routing      | [vercel.json](../../vercel.json)                                                    |

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

## Production documentation deployment

The `deploy-docs` job in [Publish](../../.github/workflows/publish.yml) depends on successful npm publication. The publishing step exposes the package version and the dist-tag it actually passed to Nx. Deployment requires `latest`, a `refs/tags/` ref and a release that is not marked as a prerelease. Failed npm publications, prereleases and manual runs against a branch do not deploy documentation.

Both jobs explicitly check out `github.sha` from the triggering Publish run. The documentation therefore uses the same commit as the published package, even if `main` advances. The Vercel project is selected through GitHub Actions secrets, and the CLI pulls its production configuration and environment variables before building.

[vercel.json](../../vercel.json) selects the generic static framework, `pnpm build-site` and output directory `dist/radix-site`. `vercel build --prod` invokes that command once: it builds Playground and Storybook, then [the composition script](../../tools/scripts/build-site.mjs) combines them with Storybook under `/docs/`. `vercel deploy --prebuilt --prod` uploads the resulting `.vercel/output` artifact without another site build. See [Vercel's build/deploy flow](https://vercel.com/docs/cli/build). Existing redirects, Playground rewrites and cache headers apply to this artifact.

Production documentation jobs are serialized without cancelling an active deployment. Immediately before deployment, the job queries `@radix-ng/primitives@latest` directly from the npm registry and compares it with the published version. A mismatch skips the upload and records the reason in the job summary, so retrying an older release cannot replace documentation for a newer npm `latest`. A registry lookup error fails the job before deployment.

Automatic Vercel Git deployments from `main` are disabled by `git.deploymentEnabled.main = false`. Pushes to `main` still run the existing CI and Chromatic workflows. Other branches retain Vercel's default preview deployment behavior; see [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration).

### Enable in production

Apply these steps in order; configure credentials before merging the workflow and Git deployment policy changes.

1. In Vercel, select the existing project serving `radix-ng.com`, confirm its organization and project IDs, repository root directory, `main` as the production branch, domain assignment and production environment variables. Create a Vercel token with access to that project. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as repository **GitHub Actions secrets**, available to the Publish workflow. These are separate from the production environment variables downloaded by `vercel pull`.
2. After the secrets are available, merge the Publish workflow and `vercel.json` changes together. This enables the release deployment job and disables automatic Git deployments from `main`. Keep the CI and Chromatic push triggers enabled. The Vercel build command and output directory are defined in the committed configuration.
3. Create the next stable tagged GitHub Release from a commit containing these changes. Confirm that npm publication succeeds under `latest`, then that `deploy-docs` completes. Verify `https://radix-ng.com/docs/` and `https://radix-ng.com/playground/` against that release's Actions checkout SHA. Runs created before the workflow change do not gain the new job on retry.

### Retry a failed deployment

Open the original **Publish** run and re-run only **Deploy documentation**, or choose **Re-run failed jobs** when publication already succeeded. Do not re-run all jobs: npm publication is already complete. The successful `publish` job's outputs remain available, and GitHub preserves the original SHA/ref for the retry; see [GitHub's rerun behavior](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs).

The retried job rebuilds from that release commit and checks npm `latest` again. If a newer version has become `latest`, it skips production deployment. Fix missing credentials or Vercel project settings before retrying; changes to workflow source itself require a new run using a commit that contains the fix.

## Environment variables and monitoring

| Secret                              | Purpose                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| `CHROMATIC_PROJECT_TOKEN`           | Chromatic visual regression                             |
| `ALGOLIA_DOCSEARCH_CRAWLER_USER_ID` | Algolia crawler                                         |
| `ALGOLIA_DOCSEARCH_CRAWLER_API_KEY` | Algolia crawler                                         |
| `ALGOLIA_DOCSEARCH_API_KEY`         | Search on the documentation site                        |
| `VERCEL_TOKEN`                      | Vercel CLI authentication for the production deployment |
| `VERCEL_ORG_ID`                     | Vercel organization that owns the production project    |
| `VERCEL_PROJECT_ID`                 | Vercel project serving `radix-ng.com`                   |

The [Algolia crawler workflow](../../.github/workflows/algolia-docsearch-crawler.yml) runs on manual dispatch. Visual regressions are reviewed in Chromatic. This is a library and static documentation site, so there is no library application server to monitor.
