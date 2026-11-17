# Accordion — Base UI compatibility

Updated 2026-11-17 against Base UI **1.9.0**, commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/accordion),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
Prepared-source SHA-256: `a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.

Root/Item selection, cancellation, native Trigger behavior and search requests are compared with
[the pinned browser suite](../../../apps/parity-testing/primitives/accordion/README.md).
Complete Panel views now belong to required `*rdxAccordionPanelPresence`, which reuses the existing
Collapsible render lifecycle ([ADR 0087](../../../docs/adr/0087-accordion-whole-panel-presence.md)).
**Full motion, measurement and client hydration parity remain open.**

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

| ID                                 | Status                                  | Contract and maintained evidence                                                                                                                                                                                                                                                                                                                                                                                              | Remaining scope                                                                                                                                                                                 |
| ---------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — array values and identity     | Resolved protocol                       | Root values/defaults/outputs are `unknown[]` in both modes. Item accepts arbitrary identities, uses native membership and generates a stable fallback for nullish/omitted values. Array items remain one value. U covers object/function/array identity, omitted values, reorder and mode changes; B covers ordinary single/multiple arrays.                                                                                  | Broader differential cases for arbitrary values and dynamic collections.                                                                                                                        |
| G2 — initial/controlled ownership  | Resolved defect                         | Defined `[value]`, including `[]`, owns selection. `(valueChange)` supports two-way binding. Uncontrolled defaults are a one-time silent snapshot; later defaults do not reset selection. Uses the established Tabs input/derived-value/uncontrolled-value seam. U covers precedence, external changes, refused requests and late defaults; B covers controlled refusal and conflicting defaults.                             | Actual client hydration; controlled/uncontrolled ownership changes across framework lifetimes.                                                                                                  |
| G3 — request transaction           | Resolved defect                         | Item emits first, then Root, then an accepted uncontrolled commit/`valueChange`. Both callbacks share details and the native event. Item veto prevents Root notification; Root veto prevents commit. External values and single-mode sibling closure do not synthesize Item callbacks. U, B cover opening/closing vetoes, controlled refusal and callback order/count.                                                        | Broader nested-Root and programmatic composition comparisons.                                                                                                                                   |
| G4 — Trigger activation            | Present, scoped B                       | Composes owned Button behavior. Native host inference replaces React's `nativeButton` flag. Default native type is button; authored submit/reset are supported. Effective Root/Item/local disabled uses native disabled for buttons and ARIA/-1 tab order for non-native hosts. Normal Tab order, Enter/Space, consumer native default prevention and authored submit are compared. U, B.                                     | Anchor-specific, repeat/blur and consumer propagation scenarios for Accordion composition; Button's own suite is not an Accordion certification.                                                |
| G5 — complete Panel view ownership | Resolved ownership defect, scoped B     | Required `*rdxAccordionPanelPresence` owns the full embedded Panel view through shared Presence and the Item Collapsible lifecycle. Initially closed children are absent, completed exit destroys components/subscriptions, and reopening creates fresh state. Retained/findable views preserve state. Native Collapsible detachment is disabled for the matching structural owner. Thirteen new U; eight new B; focused SSR. | Actual client hydration and arbitrary reparenting remain unverified. Complete motion/measurement sequencing remains G9.                                                                         |
| G6 — search reveal                 | Partial, state defect resolved          | Collapsible has one composition request adapter, registered by Item and cleaned up with it. `beforematch` goes through the same Item → Root transaction and cannot commit local Collapsible state independently. Canceled/unaccepted requests restore `hidden="until-found"`. U, B cover Item/Root veto, native event identity, controlled refusal and single-mode sibling closing.                                           | Real browser find, immediate reveal geometry and one-shot motion suppression; the paired suite dispatches `beforematch` and emulates browser attribute removal.                                 |
| G7 — part IDs and policy overrides | Present, scoped B                       | Trigger IDs register/reactively update/unregister. Native Panel exposes id; structural PanelPresence options own tri-state keepMounted/hiddenUntilFound, including explicit false and override removal. Generated IDs survive native view recreation through Item identity; part destruction clears controls. U, B cover conditional replacement, native relationships and retention precedence.                              | Broader authored-ID edits, multiple part replacement and hydration.                                                                                                                             |
| G8 — exact state surface           | Partial, settled-state defects resolved | Trigger has `data-index`, including zero. Item/Header/Trigger inherit orientation/hidden state; Header and Panel expose closed state. Closed findable Panels retain `data-starting-style`, as the actual pin does. B compares all public `data-*` on retained closed/open/findable/disabled parts; U covers index/order and state.                                                                                            | Complete animated attribute sequencing and dynamic index comparisons; lifecycle cases now observe absent/recreated hosts and pending exits.                                                     |
| G9 — measurement/motion/hydration  | **Gap, P2**                             | Accordion still aliases Collapsible bounding-rect dimensions. Structural ownership now preserves transition history and initial-open suppression across host recreation; paired cases establish held exit, reopen cancellation and Root disposal. Those cases do not establish scroll-size measurements or complete motion sequencing.                                                                                        | Compare padding/borders/transforms, horizontal/dynamic content, initial SSR keyframes, later opening, changed-content exit, sibling switching, CSS variables and real hydration/ID/view ranges. |
| G10 — regression infrastructure    | Present, scoped coverage                | 32 paired scenarios run through pnpm test-parity accordion. Five skipped placeholders were replaced in the first increment; the suite now includes whole-view/native-state/exit cases. The public Accordion behavior spec is registered in affected/full browser selection, including reverse Collapsible/Presence dependencies.                                                                                              | Actual browser find, complete motion/measurement, hydration and broader native interaction scenarios.                                                                                           |

## Public parts and defaults

Root, Item, Header, Trigger and Panel remain exported from the Accordion entry.

| Contract                       | Current Angular behavior                                                                                                        | Evidence/limit                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Root `value`                   | Array in both modes, empty by default; supplied array owns selection.                                                           | U, B. Breaking migration: scalar `'one'` → `['one']`.          |
| Root `defaultValue`            | Initial-only array; never overrides controlled selection.                                                                       | U, B.                                                          |
| Root `multiple`                | False; affects requests without reinterpreting the array shape.                                                                 | U, B.                                                          |
| Root `onValueChange`           | `{ value: unknown[], eventDetails }`, before commit, cancelable.                                                                | U, B.                                                          |
| Root `valueChange`             | Accepted request array; supports `[(value)]`.                                                                                   | U. Controlled rejection keeps rendered selection unchanged.    |
| Item `value`                   | Arbitrary identity; stable fallback for omitted/nullish values.                                                                 | U. No JSON serialization equality.                             |
| Item `onOpenChange`            | `{ open, eventDetails }`, cancelable request before Root.                                                                       | U, B. No derived-state notifications.                          |
| Trigger local props            | `id`, composed `disabled`, `type`, `tabIndex`, `role`; native host inferred.                                                    | U, B for button/span subset.                                   |
| Trigger/Panel relationships    | Open-only controls; Panel region labelled by registered Trigger.                                                                | U, B; authored IDs included.                                   |
| Root/Panel mounting policy     | Root defaults false; structural options override reactively, including explicit false. Findable implies retained complete view. | U, B, SSR for default/retained/findable and conditional views. |
| Root `orientation`/`loopFocus` | Deprecated no-ops for focus. Orientation still exposes styling state.                                                           | U, B for normal Tab behavior; no roving navigation.            |
| Panel CSS variables            | `--accordion-panel-height`, `--accordion-panel-width` alias Collapsible variables.                                              | G9 remains open.                                               |

Public MDX, demos, playground examples and SSR fixtures use array defaults and whole-Panel structural ownership.
Native Panel mount/search inputs moved to the structural options object; markup without its owner is diagnosed. The multiple demo uses
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
pnpm exec playwright test -c apps/visual-regression/playwright.floating.config.ts accordion.behavior
pnpm skills:build
pnpm agents:check
```

The [suite README](../../../apps/parity-testing/primitives/accordion/README.md) records scope and results:
**32 scenarios / 96 passing comparisons** across Chromium, Firefox and WebKit on macOS/arm64;
**75 Accordion + 15 Collapsible passing units**, no skipped construction placeholders;
**three focused SSR tests** and **nine Storybook behavior checks** across three engines pass. Library, SSR and
Storybook builds, consumer generation, focused lint/formatting and `agents:check` pass.
Browser observations and traces are written to `dist/parity-testing/accordion/results/` and retain
the reference digest and browser versions. There are no accepted differential exceptions in this
increment; untested motion/hydration behavior is not hidden by an exception file.

Next implementation priority is **G9 motion/measurement/hydration**, with the remaining G6 search-motion and real-find cases.
