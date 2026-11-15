# Saved consumer components across browser engines

This harness reevaluates the existing AppSelect (four corrected cases) and AppEmailField (eight
frozen cases). It never invokes a model or coding launcher, installs dependencies, rebuilds the
library or edits the retained applications. [REPORT.md](REPORT.md) and [summary.json](summary.json)
record the completed evaluation and the separate initial failures.

Use Node from `.nvmrc` and the existing pnpm environment. The external consumers/dependencies
identified by `dist/consumer-generation/2026-11-15-third.json` and
`dist/consumer-generation/2026-11-15-email-field-first.json` must still exist.

```bash
node --test tools/consumer-testing/generation/cross-browser/*.test.mjs
node tools/consumer-testing/generation/cross-browser/run.mjs NEW_MATRIX_ID
```

Each ID gets a new external working directory and an archive under `dist/consumer-generation/`;
an existing archive cannot be overwritten. The runner verifies original source, strict configuration,
library, skill and frozen-check hashes. It fingerprints the complete physical `node_modules` files
and symlink targets before and after. Those whole-tree fingerprints include pnpm's installation
shims. To compare the Playwright runner with another installation, package identity excludes nested
`node_modules` shims containing absolute installation paths; published runtime bytes and versions
must match. This does not normalize or modify retained dependencies.

Four new production copies use the original physical dependencies and installed Angular CLI. The
independent parents are the same fixtures used by the successful evaluations. Build stats reject
workspace inputs. Original source and all earlier archives stay unchanged.

The harness creates copies of the historical checks. `checks.mjs` adapts the server ports, routes
keyboard events through `keyboard.ts`, and establishes the independent Select host's initial checkbox
focus before its existing assertion. All assertions remain intact. On macOS WebKit only Tab and
Shift+Tab become Alt+Tab and Alt+Shift+Tab; Escape, Enter and arrows are unchanged. Firefox uses the
repository's isolated macOS app-data helper. Fresh contexts, one worker and zero retries separate
the 36 outcomes. Traces are retained for successes and failures.

The completed native reproduction can also be repeated without Angular/Radix:

```bash
node tools/consumer-testing/generation/cross-browser/reproduce-pointer-focus.mjs \
  dist/consumer-generation/NEW_NATIVE_FOCUS_REPRO
```

It saves the minimal HTML, pointer-focus observations and three traces. It then verifies explicit
focus and real forward/backward navigation past a disabled button. Use a fresh output directory.

Each matrix archive contains `report.json`, original Playwright JSON/log, `matrix.md` with links to
all 36 traces, copied checks/harness, input fingerprints and four production builds/stats. Open a
trace using `pnpm exec playwright show-trace /absolute/path/to/trace.zip`. These local artifacts are
gitignored and not uploaded or staged automatically. The original Chromium reports and failed
evaluation matrices are not replaced by a later successful run.
