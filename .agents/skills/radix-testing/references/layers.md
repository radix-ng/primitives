# Testing Radix NG Primitives

**First pick the layer, then write the test.** Most bugs in this library are caught by Vitest unit
tests — but the suite runs in **jsdom, which has no real layout** (no box sizes, `offsetHeight` /
scroll metrics, flexbox resolution, `getComputedStyle` geometry, or floating-ui positioning), and
never opens an overlay the way a user does. Those gaps have their own layers. Match the change to the
layer below before writing anything.

## Decision matrix — what changed → which layer

| The change you made / bug you fixed                                                                     | Add / run the test here                                                                |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Directive logic, state, signals, inputs/outputs, keyboard handlers, value/selection model               | **Unit** — `packages/primitives/<name>/__tests__/*.spec.ts`                            |
| ARIA roles / `aria-*` / label associations                                                              | **Unit + jest-axe** in the same spec                                                   |
| **Layout / flex / `overflow` / scroll**, part **visibility** (`[hidden]`), sizing, z-index              | **Browser** — `apps/visual-regression/tests/<name>.behavior.spec.ts` (jsdom is blind)  |
| **Overlay positioning** (side/align/collision), `*rdxXxxPortal` teleport target, anatomy nesting        | **Browser** — `behavior.spec.ts` (+ `overlays.visual.spec.ts` for the open-state look) |
| A bug that **throws only on open/interaction** — `NG0201` (missing provider), `NG0951` (required query) | **Browser** — `behavior.spec.ts` with `pageerror`/`console` listeners                  |
| Pixel-level visual / styling regression                                                                 | **Browser** — `*.visual.spec.ts` screenshot baseline                                   |
| SSR render, hydration (`ngh`), SSR-stable ids, platform guards                                          | **SSR** — `apps/radix-ssr-testing/src/ssr-rendering.spec.ts` (+ keep the page current) |
| Render/update performance of a primitive                                                                | **Perf** — `apps/radix-perf-testing/src/tests/<name>.bench.ts`                         |

> **The rule that bit us:** a select restructure made `rdxSelectList` (inline `flex:1`) a direct flex
> child of the popup; its inline flex overrode the demo's fixed viewport height, so the viewport grew
> to fit all items, never overflowed, and **both scroll buttons stayed `[hidden]`**. Every unit test
> stayed green — jsdom has no flexbox. **A layout / positioning / visibility / opens-without-error fix
> is not proven until a browser `behavior.spec.ts` covers it.**

---

## 1. Unit — Vitest, zoneless (the default)

- **Where:** `packages/primitives/<name>/__tests__/<name>-<role>.spec.ts`
- **Run:** `pnpm primitives:test` · single file: `pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/<name>/__tests__/<file>.spec.ts`
- **Stack:** Vitest + AnalogJS Angular plugin + `@testing-library/angular`. Setup `packages/primitives/test-setup.ts` sets `provideZonelessChangeDetection`, loads `@testing-library/jest-dom/vitest` + the `jest-axe` matcher, and **does not** load zone.js — the suite is **zone-free**.
- **Use Vitest APIs** (`vi.fn`, `vi.spyOn`, `vi.mock`, `vi.importActual`), never Jest globals. `xdescribe`/`xit` map to `.skip`.

**Zoneless gotchas (these are the common failures):**

- `fakeAsync` / `tick` / `waitForAsync` are **unavailable**. Instead:
  - `setTimeout`-based delays → `vi.useFakeTimers()` + `vi.advanceTimersByTime(n)`
  - render / effects settle → `await fixture.whenStable()`
  - drain a chained microtask queue → `await new Promise((r) => setTimeout(r))`
- Mutating a **plain (non-signal) field** then calling `fixture.detectChanges()` throws **`NG0100`** — call `fixture.changeDetectorRef.markForCheck()` first. Signal writes (`input.set`, `model.set`, `componentRef.setInput`) don't need it.

**a11y in the same spec** (matcher is pre-registered):

```ts
import { axe } from 'jest-axe';
// …after rendering / opening:
expect(await axe(container)).toHaveNoViolations();
```

References to copy: `drawer/__tests__/drawer.spec.ts`, `form/__tests__/form-a11y.spec.ts`.

**Standard-backed test names.** When a spec verifies an accessibility behavior, prefix the `it(...)`
title with the standard it backs: `[APG <Pattern>]` and/or `[WCAG <x.y.z>]`, APG before WCAG, no
lowercasing — e.g. `it('[APG Dialog][WCAG 4.1.2] links the trigger and popup with accessible ids and
roles', …)`. Tag only specs that map cleanly to a criterion (roles/labels, keyboard, focus
trap/restore, axe), not plumbing. This mirrors each primitive's Accessibility-table rows so the suite
reads as a traceability matrix (full convention: `radix-storybook` skill). Reference:
`dialog/__tests__/dialog.spec.ts`.

---

## 2. Browser regression — `apps/visual-regression` (Playwright over the built Storybook)

This is the layer for everything jsdom can't see. Two spec kinds live in `apps/visual-regression/tests/`:

### `<name>.behavior.spec.ts` — DOM/behavior, not pixels

Open the story via its **real interaction**, then assert. Prefer auto-retrying web-first assertions
(`expect(locator).toBeVisible()`) over fixed `waitForTimeout` so async open/positioning settles
deterministically.

```ts
import { expect, Page, test } from '@playwright/test';

async function gotoStory(page: Page, storyId: string) {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await page.waitForSelector('#storybook-root', { state: 'attached' });
}

test('scroll viewport overflows and buttons toggle', async ({ page }) => {
  await gotoStory(page, 'primitives-select--with-scroll');
  await page.locator('[rdxSelectTrigger]').first().click();

  const up = page.locator('[rdxSelectScrollUpButton]');
  const down = page.locator('[rdxSelectScrollDownButton]');
  const list = page.locator('[rdxSelectList]');

  await expect(down).toBeVisible(); // parts use the [hidden] attribute
  await expect(up).toBeHidden();
  const m = await list.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight }));
  expect(m.ch).toBeLessThan(m.sh); // a REAL overflow, not full-content expansion
  await list.evaluate((el) => el.scrollBy(0, 200));
  await expect(up).toBeVisible();
});
```

**Catch open-time runtime errors (NG0201 / NG0951)** — attach listeners **before** navigating:

```ts
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await gotoStory(page, 'primitives-select--aligned-position');
await page.locator('[rdxSelectTrigger]').first().click();
await expect(page.locator('[rdxSelectPopup]')).toBeVisible();
expect(errors).toEqual([]);
```

Story id derivation: lowercase the CSF `title`, replace `/` with `-`, append `--`, then the
kebab-cased export name. Example: title `Primitives/Select` + export `WithScroll` →
`primitives-select--with-scroll`.

### `<name>.visual.spec.ts` — screenshot diffing

`toHaveScreenshot` with `animations: 'disabled'` (asserts the **settled** state, not mid-motion).
Baselines committed under `tests/*-snapshots/`, suffixed per project+platform (`…-chromium-darwin.png`).
`stories.visual.spec.ts` auto-shoots every story; `overlays.visual.spec.ts` covers open-state
positioning. Opt a story out of the auto sweep with the `!visual` CSF tag.

### Run

```bash
pnpm test-visual          # CI path: build Storybook → serve :4400 → run every spec
pnpm test-visual:update   # regenerate screenshot baselines after an INTENTIONAL visual change
pnpm test-visual:report   # open the HTML actual/expected/diff report

# Local fast loop — reuse a running dev server, no full build:
pnpm storybook:primitives                                                              # keep on :4400
pnpm exec playwright test -c apps/visual-regression/playwright.config.ts <name>.behavior
```

`playwright.config.ts` sets `reuseExistingServer: !CI`, so a running `:4400` dev Storybook is reused;
iframe URLs resolve the same as the built site. `test-results/` + `playwright-report/` are gitignored;
specs and `*-snapshots/` baselines are committed. For a quick one-off investigation you can also write
a throwaway Playwright script against `:4400` (`import { chromium } from 'playwright'`, run from repo
root) — but **land the finding as a committed `behavior.spec.ts`**, don't leave the script.

---

## 3. SSR — `apps/radix-ssr-testing`

- **Run:** `nx run radix-ssr-testing:test` (Vitest; still `passWithNoTests`).
- `src/ssr-rendering.spec.ts` renders primitive pages via `renderApplication` (`@angular/platform-server`) and asserts: server render doesn't throw, markup is present, hydration annotations (`ngh`) are emitted, ids are SSR-stable. Needs `import '@angular/compiler';` at the top (platform-server is partially compiled → JIT fallback).
- **CI includes this app in affected tests and builds.** When you change a primitive's public API, update the matching page under `src/app/components/<name>/page.ts` — keep consumer templates current with public API changes; the render spec and AOT build catch drift.

---

## 4. Performance — `apps/radix-perf-testing`

- **Run:** `pnpm primitives:bench` (Vitest **browser mode** — real Chromium, real layout).
- **Where:** `apps/radix-perf-testing/src/tests/<name>.bench.ts`. Copy `select.bench.ts` / `checkbox.bench.ts`.
- Design & how to read the report: ADR `docs/adr/0009`, and `apps/radix-storybook/docs/guides/performance.docs.mdx` (`Guides/Performance`). Keep a bench's anatomy in sync with the primitive (the select bench reproduces the real template).

---

## Failure → cause quick reference

| Symptom                                                      | Cause & fix                                                                                                      |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `NG0100` (ExpressionChanged) after `fixture.detectChanges()` | Plain (non-signal) field write didn't dirty the view → `fixture.changeDetectorRef.markForCheck()` first          |
| `NG0951` (required child query has no value)                 | `contentChild.required(X)` found nothing — the template/anatomy no longer renders `X`; fix wiring, not the query |
| `NG0201` (no provider for X) only when opening               | A directive injects a provider that the restructure moved to a **descendant**; read it off the child instead     |
| `fakeAsync`/`tick` "is not a function"                       | Suite is zoneless → use `vi.useFakeTimers()` / `whenStable()` / a macrotask (see §1)                             |
| Unit test green but the bug is layout/visibility/positioning | jsdom blind spot → it needs a **browser `behavior.spec.ts`** (§2), not a unit test                               |
| Screenshot diff after an intentional visual change           | `pnpm test-visual:update` to re-baseline (review the diff first)                                                 |
