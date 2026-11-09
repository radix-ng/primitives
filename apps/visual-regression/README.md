# Visual regression

Self-hosted screenshot diffing for the primitives, run over the built Storybook with
[`@playwright/test`](https://playwright.dev/docs/test-snapshots). Replaces the (unused) Chromatic
setup for catching layout, positioning, and styling regressions.

## Run

```bash
pnpm test-visual            # build Storybook, then diff every story against the baselines
pnpm test-visual:update     # regenerate baselines (after an intentional visual change)
pnpm test-visual:report     # open the HTML diff report from the last run
pnpm test-browser:select   # build Storybook and run Select behavior checks in three desktop engines
```

`pnpm test-visual` builds Storybook (`dist/radix-storybook`), serves it on `:4400`, and screenshots
each story. A failing diff opens as side-by-side actual/expected/diff in the HTML report.

For Select behavior checks, install `chromium firefox webkit` with `pnpm exec playwright install`.
`playwright.select.config.ts` reuses the same `select*.behavior.spec.ts` files in all three engines;
it excludes screenshots, so it does not create or change visual baselines. To rerun one engine against
an existing build:

```bash
pnpm exec playwright test -c apps/visual-regression/playwright.select.config.ts --project=webkit
```

Engine setup, including Firefox app-data isolation on macOS, is shared with the
[differential runner](../parity-testing/README.md). CI runs both in the `parity` job and uploads the
Storybook HTML report and failure traces as well as differential observations. Passing desktop
automation does not replace real Safari/device, screen-reader or saved-profile autofill checks.

## What's covered

- **`tests/stories.visual.spec.ts`** — one screenshot per story, auto-generated from
  `dist/radix-storybook/index.json`. Captures each primitive's default rendered state.
- **`tests/overlays.visual.spec.ts`** — open-state checks for overlays (popover, dialog, tooltip,
  menu, select, context-menu) where positioning matters; the auto spec only sees the closed trigger.
  Each opens via its real interaction — click, hover (tooltip), or right-click (context-menu).

Screenshots are taken with `animations: 'disabled'`, so they assert the **settled** visual
(final positioning and open/closed look), not a frame mid-transition.

## Baselines

Committed under `tests/*-snapshots/`. Playwright suffixes each file with project + platform
(`…-chromium-darwin.png`), so macOS and Linux baselines coexist. When wiring CI, generate the Linux
set inside the official Playwright Docker image so local and CI renders match:

```bash
docker run --rm -v "$(pwd)":/work -w /work mcr.microsoft.com/playwright:v1.60.0-noble \
  sh -c "pnpm install && pnpm test-visual:update"
```

Opt a story out of the auto sweep by adding the `!visual` tag to its CSF `tags`.
