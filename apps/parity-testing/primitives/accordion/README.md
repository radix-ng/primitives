# Accordion pinned comparisons

Run `pnpm test-parity accordion` (or add `--project=chromium` for iteration).
The suite is discovered automatically by the shared runner and CI selection. It compares independent
Angular and React fixtures against the exact source in `../../reference.json`; no recording adapter
synchronizes the implementations.

## Current scope

**32 scenarios, 96 passing comparisons** across Chromium, Firefox and WebKit on macOS/arm64,
2026-11-17, against Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
There are **zero accepted exceptions** and no capability skips in this suite.

- Single/multiple array requests, switching siblings, Item-first/Root-second callback order and
  shared details/native event identity.
- Controlled rejection, conflicting defaults, Item/Root veto on opening and closing.
- Button/span Enter and Space, effective Root/Item/Trigger disabled, normal Tab order,
  native default prevention and an authored submit type.
- Authored IDs, open-only controls, Panel labels and all public state attributes on retained
  closed/open/disabled/findable parts, including index zero and persistent search starting style.
- `beforematch` acceptance, Item/Root veto, controlled refusal and closing a single-mode sibling.
  The driver dispatches the event and emulates the browser removing `hidden`; this is not a real
  browser find-in-page test.

- Eight whole-Panel lifetime cases cover default child-view disposal, retained/findable state,
  interrupted exit, Root disposal, override removal, keyed reorder/removal and conditional Panel return.
  Native input state, child creation/destruction and relationships are compared. Exit scenarios
  declare enter CSS before first opening because the pin discovers motion type on open.

The driver retains raw DOM, native events, callback traces and reference digest; it excludes only
Angular's internal `data-rdx-*` identity bookkeeping from the public styling attribute comparison.
Generated IDs are checked by native relationships rather than comparing framework-specific strings.

The original 24 scenarios explicitly retain Panels; the eight lifetime scenarios compare default
unmounting as well as retained/findable policies. They establish complete child-view disposal and
native state reset/preservation, with no accepted exceptions. They do not certify CSS variable
measurements, full animation sequencing, actual browser find or client hydration. Remaining
contracts are in [Accordion PARITY.md](../../../../packages/primitives/accordion/PARITY.md).

## Other validation in this increment

- **75 Accordion unit tests**, no skipped placeholders; **15 affected Collapsible unit tests**.
- **Three focused Accordion SSR tests**, including array defaults, authored relationships and native
  disabled state, absent/kept/findable/open/controlled Panel views; unrelated SSR cases are filtered out.
- Three public Storybook scenarios pass in Chromium, Firefox and WebKit (nine checks): controlled array cancellation, multiple defaults and default-versus-retained Panel native state. The behavior spec participates in affected/full CI selection.
- Library, SSR application and Storybook production builds, public consumer-bundle generation, focused lint, formatting and agent documentation checks.

Reports are written to `dist/parity-testing/accordion/results/`, including browser versions,
observations, exact differences, failures and Playwright traces. The suite's empty
`expected-differences.json` cannot suppress untested behavior.

```bash
pnpm exec vitest run --config packages/primitives/vite.config.ts \
  packages/primitives/accordion/__tests__ packages/primitives/collapsible/__tests__
pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts -t 'Accordion|accordion'
pnpm exec nx run radix-storybook:build-storybook
pnpm exec playwright test -c apps/visual-regression/playwright.floating.config.ts accordion.behavior
```
