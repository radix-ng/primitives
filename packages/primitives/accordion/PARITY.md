# Accordion — Base UI compatibility

Updated 2026-11-17 against Base UI **1.9.0**, commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/accordion),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
Prepared-source SHA-256: `a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.

The first implementation increment replaces the Root/Item state and request protocol, composes
owned Button behavior, routes search requests through Accordion and establishes a
[paired browser suite](../../../apps/parity-testing/primitives/accordion/README.md).
**Complete Panel view ownership and motion/hydration parity remain open.** Passing retained-panel
cases does not establish those contracts.

## Change policy

**Breaking changes are explicitly permitted. Backward compatibility does not constrain the target
architecture, API or priorities.** Inputs, value types, event payloads, part boundaries, defaults and
Panel template/lifetime APIs may be replaced or removed when that improves the Angular design or
aligns observable behavior with Base UI.

- Prefer Base UI behavior implemented through Angular signals, DI, native hosts and owned views.
  React render/ref syntax does not require an identically named Angular API.
- Do not retain scalar-value compatibility branches, deprecated aliases, duplicate state or manual
  DOM ownership solely to preserve the old API.
- Earlier deviations and deferrals describe current/history decisions; reassess them. Update or
  supersede an ADR if the resulting lasting design replaces an accepted decision.
- Update consumers, stories, SSR fixtures, public docs, generated skills and regression evidence in
  the same implementation increment. Compare defaults as well as explicitly configured cases.

## Evidence and status

**S** = pinned implementation; **U** = maintained Angular unit; **B** = paired browser observation;
**SSR** = server-render assertion. A resolved defect is narrower than complete parity of a part.
“Partial” includes known missing behavior or an explicit boundary that has not been compared.

| ID                                 | Status                                  | Contract and maintained evidence                                                                                                                                                                                                                                                                                                                                                                  | Remaining scope                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — array values and identity     | Resolved protocol                       | Root values/defaults/outputs are `unknown[]` in both modes. Item accepts arbitrary identities, uses native membership and generates a stable fallback for nullish/omitted values. Array items remain one value. U covers object/function/array identity, omitted values, reorder and mode changes; B covers ordinary single/multiple arrays.                                                      | Broader differential cases for arbitrary values and dynamic collections.                                                                                                                                                                                                                                                                                                            |
| G2 — initial/controlled ownership  | Resolved defect                         | Defined `[value]`, including `[]`, owns selection. `(valueChange)` supports two-way binding. Uncontrolled defaults are a one-time silent snapshot; later defaults do not reset selection. Uses the established Tabs input/derived-value/uncontrolled-value seam. U covers precedence, external changes, refused requests and late defaults; B covers controlled refusal and conflicting defaults. | Actual client hydration; controlled/uncontrolled ownership changes across framework lifetimes.                                                                                                                                                                                                                                                                                      |
| G3 — request transaction           | Resolved defect                         | Item emits first, then Root, then an accepted uncontrolled commit/`valueChange`. Both callbacks share details and the native event. Item veto prevents Root notification; Root veto prevents commit. External values and single-mode sibling closure do not synthesize Item callbacks. U, B cover opening/closing vetoes, controlled refusal and callback order/count.                            | Broader nested-Root and programmatic composition comparisons.                                                                                                                                                                                                                                                                                                                       |
| G4 — Trigger activation            | Present, scoped B                       | Composes owned Button behavior. Native host inference replaces React's `nativeButton` flag. Default native type is button; authored submit/reset are supported. Effective Root/Item/local disabled uses native disabled for buttons and ARIA/-1 tab order for non-native hosts. Normal Tab order, Enter/Space, consumer native default prevention and authored submit are compared. U, B.         | Anchor-specific, repeat/blur and consumer propagation scenarios for Accordion composition; Button's own suite is not an Accordion certification.                                                                                                                                                                                                                                    |
| G5 — complete Panel view ownership | **Gap, P1**                             | Current Collapsible Panel detaches/reinserts its native host with a marker; Angular children remain alive. Initially closed children are constructed; closing does not destroy them; reopening reuses their native state.                                                                                                                                                                         | Own the whole Panel template using Angular view lifetime and the shared render lifecycle, following [ADR 0077](../../../docs/adr/0077-tabs-whole-panel-presence.md). Compare child init/destroy/subscriptions, state reset/retention, close/reopen, dynamic `@if`/`@for`, reparent/removal and SSR/hydration. Breaking syntax is permitted. Do not add a parallel lifetime machine. |
| G6 — search reveal                 | Partial, state defect resolved          | Collapsible has one composition request adapter, registered by Item and cleaned up with it. `beforematch` goes through the same Item → Root transaction and cannot commit local Collapsible state independently. Canceled/unaccepted requests restore `hidden="until-found"`. U, B cover Item/Root veto, native event identity, controlled refusal and single-mode sibling closing.               | Real browser find, immediate reveal geometry and one-shot motion suppression; the paired suite dispatches `beforematch` and emulates browser attribute removal.                                                                                                                                                                                                                     |
| G7 — part IDs and policy overrides | Partial, API defects resolved           | Trigger authored IDs register/reactively update/unregister. Panel exposes `id`, `keepMounted`, `hiddenUntilFound`; its optional booleans derive from Root without competing context writes, including explicit false and removal. Destroyed Panels clear controls; remount restores generated identity. U; B covers authored IDs and relationships.                                               | Differential conditional part replacement, dynamic IDs and full override/removal precedence; complete view ownership depends on G5.                                                                                                                                                                                                                                                 |
| G8 — exact state surface           | Partial, settled-state defects resolved | Trigger has `data-index`, including zero. Item/Header/Trigger inherit orientation/hidden state; Header and Panel expose closed state. Closed findable Panels retain `data-starting-style`, as the actual pin does. B compares all public `data-*` on retained closed/open/findable/disabled parts; U covers index/order and state.                                                                | Animated starting/ending observations, reorders/removals and unmounted panels.                                                                                                                                                                                                                                                                                                      |
| G9 — measurement/motion/hydration  | **Gap, P2**                             | Accordion aliases Collapsible bounding-rect dimensions. Its imperative animation suppression and one mount-style unit do not establish the pin's scroll-size measurements or lifecycle sequencing.                                                                                                                                                                                                | Browser comparisons for padding/borders/transforms, horizontal/dynamic content, initial SSR keyframes, subsequent opening, exit after content changes, switching siblings, rapid reopen and CSS variables. Add real hydration/ID/view-range cases using owned lifecycle utilities.                                                                                                  |
| G10 — regression infrastructure    | Partial, established                    | A registered differential suite now runs via `pnpm test-parity accordion` and is discovered by CI. Five skipped construction placeholders were replaced with behavior tests. Dedicated Accordion units include request/identity/default/activation/ARIA/search regressions.                                                                                                                       | Expand the suite to G5/G9 view/motion cases, actual browser find and hydration. Two public Storybook checks cover array binding/cancellation and multiple defaults.                                                                                                                                                                                                                 |

## Public parts and defaults

Root, Item, Header, Trigger and Panel remain exported from the Accordion entry.

| Contract                       | Current Angular behavior                                                                            | Evidence/limit                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Root `value`                   | Array in both modes, empty by default; supplied array owns selection.                               | U, B. Breaking migration: scalar `'one'` → `['one']`.       |
| Root `defaultValue`            | Initial-only array; never overrides controlled selection.                                           | U, B.                                                       |
| Root `multiple`                | False; affects requests without reinterpreting the array shape.                                     | U, B.                                                       |
| Root `onValueChange`           | `{ value: unknown[], eventDetails }`, before commit, cancelable.                                    | U, B.                                                       |
| Root `valueChange`             | Accepted request array; supports `[(value)]`.                                                       | U. Controlled rejection keeps rendered selection unchanged. |
| Item `value`                   | Arbitrary identity; stable fallback for omitted/nullish values.                                     | U. No JSON serialization equality.                          |
| Item `onOpenChange`            | `{ open, eventDetails }`, cancelable request before Root.                                           | U, B. No derived-state notifications.                       |
| Trigger local props            | `id`, composed `disabled`, `type`, `tabIndex`, `role`; native host inferred.                        | U, B for button/span subset.                                |
| Trigger/Panel relationships    | Open-only controls; Panel region labelled by registered Trigger.                                    | U, B; authored IDs included.                                |
| Root/Panel mounting policy     | Root defaults false; optional Panel overrides, including explicit false. Findable implies retained. | U; G5 remains a native-host/Angular-view mismatch.          |
| Root `orientation`/`loopFocus` | Deprecated no-ops for focus. Orientation still exposes styling state.                               | U, B for normal Tab behavior; no roving navigation.         |
| Panel CSS variables            | `--accordion-panel-height`, `--accordion-panel-width` alias Collapsible variables.                  | G9 remains open.                                            |

Public MDX, demos, playground examples and SSR fixtures use array defaults. The multiple demo uses
`defaultValue` so interactions remain uncontrolled. Native `preventDefault()` controls browser
defaults; Item/Root `eventDetails.cancel()` controls the state transaction. The React-only
`preventBaseUIHandler()` event extension is not copied onto native Angular events.

## Verification

```bash
pnpm test-parity accordion
pnpm exec vitest run --config packages/primitives/vite.config.ts \
  packages/primitives/accordion/__tests__ packages/primitives/collapsible/__tests__
pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts -t 'Accordion|accordion'
pnpm primitives:build
pnpm primitives:ssr:build
pnpm exec nx run radix-storybook:build-storybook
pnpm exec playwright test -c apps/visual-regression/playwright.config.ts accordion.behavior --project=chromium
pnpm skills:build
pnpm agents:check
```

The [suite README](../../../apps/parity-testing/primitives/accordion/README.md) records scope and results:
**24 scenarios / 72 passing comparisons** across Chromium, Firefox and WebKit on macOS/arm64;
**62 Accordion + 15 Collapsible passing units**, no skipped construction placeholders;
**two focused SSR tests** and **two Chromium Storybook behavior tests** pass. Library, SSR and
Storybook builds, consumer generation, focused lint/formatting and `agents:check` pass.
Browser observations and traces are written to `dist/parity-testing/accordion/results/` and retain
the reference digest and browser versions. There are no accepted differential exceptions in this
increment; untested G5/G9 behavior is not hidden by an exception file.

Next implementation priority is **G5 whole-Panel ownership**, then **G9 motion/measurement/hydration**.
