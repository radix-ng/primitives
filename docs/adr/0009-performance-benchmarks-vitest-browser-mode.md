# ADR 0009: Performance Benchmarks via Vitest Browser Mode (base-ui–style harness, Angular-native metrics)

- Status: Proposed
- Date: 2026-06-12
- Decision owners: Radix NG maintainers
- Related: new project `apps/radix-perf-testing` (consumers: all primitives; pilot: `checkbox`, `select`), `.github/workflows/`, `tools/scripts/benchmark/`

## Context

The library has no performance testing of any kind today — no harness, no bench files, no CI step.
Regressions in mount cost (DI context creation, `effect()` setup, host bindings) or in large-list
scenarios (Select/Autocomplete popups with hundreds of options) are only caught by accident.

[Base UI](https://base-ui.com/) — our primary reference — runs per-PR performance tests and posts a
comparison comment on every PR:

```
Performance
Total duration: 1,277.17 ms  -177.08 ms (-12.2%) | Renders: 50 (+0) | Paint: 1,917.67 ms  -266.72 ms (-12.2%)

Test                              Duration                      Renders
Checkbox mount (500 instances)    66.82 ms ▼ -47.27 ms (-41.4%) 1 (+0)
11 tests within noise — details
```

### How base-ui actually does it (verified against source)

- Bench files live in [`test/performance/tests/*.bench.tsx`](https://github.com/mui/base-ui/tree/master/test/performance);
  the whole `vitest.config.ts` is one line: `createBenchmarkVitestConfig()` from
  [`@mui/internal-benchmark`](https://github.com/mui/mui-public/tree/master/packages/benchmark) (lives in `mui/mui-public`).
- The runner is **Vitest Browser Mode with Playwright (real Chromium)** — not jsdom, not Tachometer,
  and **not** Vitest's built-in `bench()`/Tinybench.
- Their `benchmark(name, render, interaction?, options?)` helper does 10 warmup runs + 20 measured
  runs (configurable), with IQR-based outlier removal.
- Metrics:
  - **Duration / Renders** — `React.Profiler` on React's profiling build;
  - **Paint** — the **Element Timing API**: an invisible sentinel element with an `elementtiming`
    attribute observed via `PerformanceObserver`, capturing the time until the browser actually
    paints the frame. This part is framework-agnostic.
- CI (CircleCI): `BENCHMARK_UPLOAD=true pnpm test:benchmark` uploads result JSON to S3 keyed by SHA.
  Baseline comes either from a **same-job run of the base branch** (`BENCHMARK_BASELINE_PATH` —
  same runner for both sides, which is also their noise mitigation) or as a fallback from S3 by
  merge-base SHA.
- The PR comment is **compact**; its "details" link points to MUI's
  [code-infra dashboard](https://github.com/mui/mui-public/tree/master/apps/code-infra-dashboard)
  (`code-infra-dashboard.onrender.com/benchmark-details/...?sha=…&base=…&prNumber=…`), which fetches
  `benchmark.json` for both SHAs from their **private S3 bucket** (`mui-org-ci`) and renders the
  full comparison. The dashboard itself is MUI-internal ("highly opinionated", external feature
  requests not accepted) and reads only their bucket — **not reusable by third parties**.
- The comparison logic, however, is open source —
  [`compareBenchmarkReports.ts`](https://github.com/mui/mui-public/blob/master/apps/code-infra-dashboard/src/lib/benchmark/compareBenchmarkReports.ts):
  "within noise" is a plain relative-difference threshold (`NOISE_THRESHOLD = 0.2`, i.e. ±20%; no
  confidence intervals or t-tests), severity is error/success only beyond it, totals are simple
  sums compared with the same rule, and per-test rows show **mean ± stdDev** plus an outlier count.

### What does and does not transfer

| base-ui piece                                     | Transfers?      | Angular-native replacement                                                                                                          |
| ------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Vitest Browser Mode + Playwright                  | ✅ as-is        | We already use Vitest + the AnalogJS Angular Vite plugin                                                                            |
| `benchmark()` with warmup/runs/IQR                | ✅ design as-is | Own ~150-line harness (no React dependency in the algorithm)                                                                        |
| `React.Profiler` for Renders                      | ❌              | Count change-detection cycles by wrapping `ApplicationRef.tick`; optionally Angular's DevTools profiler hook (`ɵsetProfiler`) later |
| Element Timing sentinel for Paint                 | ✅ as-is        | Same `elementtiming` attribute + `PerformanceObserver`, nothing React-specific                                                      |
| S3 upload (private bucket `mui-org-ci`)           | ❌ overkill     | Same-runner baseline via `git worktree` at merge-base; result JSONs kept as workflow artifacts                                      |
| code-infra dashboard (details page)               | ❌ MUI-internal | GitHub Actions **job summary** (`$GITHUB_STEP_SUMMARY`) with the full table; the PR comment links to it                             |
| `compareBenchmarkReports.ts` logic & table format | ✅ port it      | `tools/scripts/benchmark/compare.mjs` ports the diff/severity/totals logic and rendering                                            |
| CircleCI + bot comment                            | ❌              | GitHub Actions + sticky PR comment                                                                                                  |

## Decision

Mirror base-ui's benchmark design 1:1 on our stack:

1. A dedicated Nx project **`apps/radix-perf-testing`** (naming mirrors `apps/radix-ssr-testing`)
   running **Vitest Browser Mode with the Playwright provider (Chromium)**. It is **not** part of the
   regular `test` target and is excluded from CI's normal test/build runs the same way
   `radix-ssr-testing` is.
2. An own **`benchmark()` harness** (in `apps/radix-perf-testing/src/harness/`) implementing
   warmup + measured runs + IQR outlier removal, producing a result JSON per run.
3. **Angular-native metrics**: wall-clock mount duration, change-detection cycle count, and paint
   time via the Element Timing API.
4. **CI comparison on the same runner**: benchmark the PR head, then the merge-base via
   `git worktree`, diff the two JSONs with a Node script, and post/update a **sticky PR comment**
   with the comparison table and a within-noise verdict per test.

## Alternatives considered

- **[Tachometer](https://github.com/google/tachometer)** — statistically rigorous, real browser,
  built-in two-build comparison. Rejected: requires standalone HTML harness pages per scenario
  (a parallel build pipeline next to Vitest), and its horizon for maintenance is unclear. Vitest
  browser mode gives us the same real-Chromium fidelity inside infra we already run.
- **Vitest `bench()` (Tinybench) in jsdom** — cheapest to add, but jsdom has no layout/paint, so no
  Paint metric and unrealistic DOM costs; Tinybench also cannot express the renders/paint metrics,
  so we'd outgrow it immediately. Rejected as the primary harness (it was the original proposal
  before base-ui's actual setup was verified).
- **Manual profiling with Angular DevTools** — not automatable, no PR gate. Not an alternative,
  just the status quo.

## Detailed design

### Directory layout

```
apps/radix-perf-testing/
  project.json               # Nx project, target: bench (@nx/vitest:test or run-commands)
  vite.config.mts            # browser mode config (see below)
  tsconfig.json
  src/
    harness/
      benchmark.ts           # benchmark() — warmup, runs, IQR, result collection
      metrics.ts             # CD-cycle counter, Element Timing paint observer
      mount.ts               # mountN() — createApplication + createComponent helpers
      reporter.ts            # writes bench-results.json (BENCH_OUTPUT_PATH env)
    tests/
      checkbox.bench.ts      # pilot: mount 500, toggle interaction
      select.bench.ts        # pilot: open popup with 1000 options
tools/scripts/benchmark/
  compare.mjs                # head.json + base.json → markdown table + noise verdict
```

### Vite/Vitest config

```ts
// apps/radix-perf-testing/vite.config.mts
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [angular(), tsconfigPaths()],
  test: {
    include: ['src/tests/**/*.bench.ts'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }]
    },
    // benchmarks are sequential by nature — one file at a time, no parallelism
    fileParallelism: false
  }
});
```

Notes:

- **Do not reuse `packages/primitives/test-setup.ts`** — it initializes the jsdom/TestBed
  environment. The perf app bootstraps real applications via `createApplication` instead.
- `*.bench.ts` files use plain `it()`/`describe()` from Vitest (as base-ui does — their `.bench.tsx`
  files are regular browser-mode tests, the "bench" is the helper, not Vitest bench mode), so the
  `include` pattern above keeps them out of every other project's `**/*.spec.ts` globs.
- The suite stays **zoneless**: `provideZonelessChangeDetection()` in every bootstrapped app.

### Harness API

```ts
export interface BenchmarkOptions {
  runs?: number; // default 20
  warmupRuns?: number; // default 10
}

export interface BenchmarkResult {
  name: string;
  duration: Stats; // ms, IQR-filtered: median, mean, stdDev, min, max, samples, outliersRemoved
  renders: number; // CD cycles during the measured section (must be stable across runs)
  paint?: Stats; // ms, time to sentinel paint (Element Timing)
}

export async function benchmark(
  name: string,
  setup: () => BenchScenario, // fresh component/app per iteration
  interaction?: (ctx: BenchContext) => Promise<void>, // optional re-render scenario
  options?: BenchmarkOptions
): Promise<void>;
```

Per iteration:

1. `setup()` creates a fresh host element + `createApplication({ providers: [provideZonelessChangeDetection()] })`,
   then `createComponent()` × N into it. The harness appends its own sentinel
   `<div elementtiming="bench-sentinel">` after the mounted components (see risk 2 for the
   constraints on that element).
2. `performance.mark()` before mount; `ApplicationRef.tick()` (wrapped to count CD cycles); await the
   sentinel's `PerformanceObserver` entry (type `element`) for the paint timestamp.
3. If `interaction` is provided, measure it as a separate named section (mutate signals, await
   stabilization + a fresh sentinel paint).
4. Destroy the `ApplicationRef`, remove the host element, `performance.clearMarks()`.

After all iterations: drop outliers outside `[Q1 - 1.5·IQR, Q3 + 1.5·IQR]`, compute stats, append to
the in-memory result list. A Vitest `afterAll`/reporter hook writes the full
`BenchmarkResult[]` JSON to `process.env.BENCH_OUTPUT_PATH ?? 'bench-results.json'`.

**Renders metric**: wrap `ApplicationRef.tick` (or subscribe to a counter incremented in an
`afterRender` callback registered on the app injector) and report the count per iteration. It must be
deterministic; the harness should warn if the count varies across runs. `ɵsetProfiler`-based template
profiling is explicitly out of scope for v1 (private API; revisit only if CD-cycle counts prove too
coarse).

### Pilot bench files

- `checkbox.bench.ts`:
  - `Checkbox mount (500 instances)` — direct analog of base-ui's test;
  - `Checkbox toggle (500 instances)` — interaction: flip all `checked` signals, one CD pass expected.
- `select.bench.ts`:
  - `Select open (1000 options)` — mount closed, interaction opens the popup; this covers collection
    (DOM-order `contentChildren`), popper positioning, and portal cost — our highest-risk path.

Scenario components live next to the bench files, are standalone, and use **no styles** (headless —
paint cost is dominated by DOM size, which is exactly what we want to track).

### Scripts and targets

- `project.json` target `radix-perf-testing:bench` (vitest run with the config above).
- Root `package.json`: `"primitives:bench": "nx run radix-perf-testing:bench"` under the
  `----Radix Primitives---` section.
- Nx: the target must **not** be cacheable (timings are not reproducible artifacts).

### CI: comparison job and PR comment

New workflow `.github/workflows/benchmark.yml`:

- Trigger: `pull_request` with a `paths` filter on `packages/primitives/**` (plus the perf app and
  the workflow itself). Add a `workflow_dispatch` for manual runs.
- Steps:
  1. Checkout with `fetch-depth: 0`; `pnpm install`; install Playwright Chromium.
  2. Bench **head**: `BENCH_OUTPUT_PATH=head.json pnpm primitives:bench`.
  3. `git worktree add ../base $(git merge-base HEAD origin/main)`; `pnpm install` in the worktree;
     bench **base** there with `BENCH_OUTPUT_PATH=base.json`, **reusing the head worktree's harness
     if the perf app doesn't exist at merge-base yet** (bootstrap period: skip comparison and post a
     "baseline unavailable" comment instead of failing).
  4. `node tools/scripts/benchmark/compare.mjs head.json base.json` produces **two outputs**:
     a compact `comment.md` and a full per-test breakdown appended to `$GITHUB_STEP_SUMMARY`
     (our substitute for base-ui's dashboard details page). `compare.mjs` **ports the diff /
     severity / totals logic and table format** from base-ui's open-source
     [`compareBenchmarkReports.ts`](https://github.com/mui/mui-public/blob/master/apps/code-infra-dashboard/src/lib/benchmark/compareBenchmarkReports.ts)
     rather than inventing its own.
  5. Post/update a sticky comment (`marocchino/sticky-pull-request-comment` or
     `actions/github-script` with a hidden marker), formatted like base-ui's:
     totals line, per-test table (duration delta with ▲/▼ and %, renders delta), collapsed
     `<details>` for within-noise tests, and a **"details" link to the workflow run's job summary**.
  6. Upload `head.json` / `base.json` as **workflow artifacts** (the repo-local substitute for
     base-ui's S3-by-SHA storage; subject to the default artifact retention window).
- **Noise rule (v1)**: follow base-ui's actual rule — _within noise_ when
  `|relative Δ of the median| ≤ 20%` (`NOISE_THRESHOLD = 0.2`; they apply it to means, we apply it
  to IQR-filtered medians). Optionally tighten later (e.g. require non-overlapping IQR ranges) once
  real runner variance is known — base-ui's generous 20% reflects how noisy CI timings actually are.
- The job is **informational only** (no required status) until variance on GitHub-hosted runners is
  characterized; same-runner head/base execution is the primary mitigation.

## Consequences

Positive:

- Per-PR regression visibility for mount cost and large-list popup scenarios, with real-browser
  paint numbers — matching the reference project's developer experience.
- The harness algorithm (warmup/runs/IQR, Element Timing) is copied from a battle-tested design
  instead of invented.
- No external storage or services; the whole pipeline is repo-local.

Negative / accepted costs:

- GitHub-hosted runners are noisy; even with same-runner comparison, small regressions (<5%) will
  hide in noise. Accepted for v1; thresholds are tunable and the job is non-blocking.
- The CI job installs dependencies twice (head + merge-base worktree). Accepted: pnpm store makes
  the second install cheap.
- Renders metric is coarser than React's Profiler (CD cycles, not per-component render timings).
  Accepted; can be deepened later via the profiler hook.

## Risks and open questions

1. **AnalogJS Angular plugin under Vitest Browser Mode** — the main technical risk; it is known to
   work in jsdom and in Storybook's Vite pipeline, but browser mode must be verified first.
   **Mitigation / go-no-go**: phase 1 is a spike that mounts one Checkbox in browser mode before any
   harness work. Fallback if it fails: precompile scenarios with a small Vite build (the Storybook
   builder path) — decided only if needed.
2. **Element Timing in headless Chromium** — paints do occur in headless mode, but the observer
   wiring must be verified in the spike. The entry type `element` requires the `elementtiming`
   attribute on a rendered, non-`display:none` element — the harness appends a 1×1 transparent
   sentinel element itself (scenario components don't need to know about it), positioned offscreen
   rather than hidden.
3. **Runner variance** — collect ~2 weeks of runs before considering making the check blocking or
   alerting on it.

## Rollout plan (implementation phases)

1. **Spike (go/no-go)**: `apps/radix-perf-testing` skeleton + browser-mode config + one trivial test
   mounting `RdxCheckboxRootDirective`-based component and observing a sentinel `element` timing
   entry. Verifies risks 1 and 2.
2. **Harness + pilots**: `benchmark()` with warmup/runs/IQR, CD-cycle counter, JSON reporter;
   `checkbox.bench.ts` and `select.bench.ts`; `primitives:bench` script; local numbers reviewed for
   stability (run 5× locally, compare medians).
3. **CI**: `benchmark.yml`, `compare.mjs`, sticky comment, noise thresholds; non-blocking.
4. **Later (separate decisions)**: more primitives (Autocomplete virtualized, Menu, Slider drag),
   profiler-hook render timings, blocking thresholds, historical tracking.

## References

- base-ui bench file: <https://github.com/mui/base-ui/blob/master/test/performance/tests/checkbox.bench.tsx>
- base-ui perf suite: <https://github.com/mui/base-ui/tree/master/test/performance>
- `@mui/internal-benchmark`: <https://github.com/mui/mui-public/tree/master/packages/benchmark>
- base-ui CI job (`test_benchmark`): <https://github.com/mui/base-ui/blob/master/.circleci/config.yml>
- MUI code-infra dashboard (benchmark details page; MUI-internal, reads their private S3): <https://github.com/mui/mui-public/tree/master/apps/code-infra-dashboard>
- Comparison/noise logic to port into `compare.mjs`: <https://github.com/mui/mui-public/blob/master/apps/code-infra-dashboard/src/lib/benchmark/compareBenchmarkReports.ts>
- Element Timing API: <https://developer.mozilla.org/en-US/docs/Web/API/PerformanceElementTiming>
- Vitest Browser Mode: <https://vitest.dev/guide/browser/>
