# Accordion — Base UI compatibility

Updated 2026-11-17 against Base UI **1.9.0**, commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/accordion),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
Prepared-source SHA-256: `a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.

Root/Item selection, cancellation, native Trigger behavior and search requests are compared with
[the pinned browser suite](../../../apps/parity-testing/primitives/accordion/README.md).
Complete Panel views now belong to required `*rdxAccordionPanelPresence`, which reuses the existing
Collapsible render lifecycle ([ADR 0087](../../../docs/adr/0087-accordion-whole-panel-presence.md)).
Scroll-size motion, native Firefox search, browser fragment reveal and basic client hydration now have
focused evidence. **Remaining motion combinations, native toolbar search in Chromium/WebKit and
broader hydration parity stay open.**

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

| ID                                 | Status                                       | Contract and maintained evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Remaining scope                                                                                                                                                               |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — array values and identity     | Resolved protocol                            | Root values/defaults/outputs are `unknown[]` in both modes. Item accepts arbitrary identities, uses native membership and generates a stable fallback for nullish/omitted values. Array items remain one value. U covers object/function/array identity, omitted values, reorder and mode changes; B covers ordinary single/multiple arrays.                                                                                                                                                                                                                  | Broader differential cases for arbitrary values and dynamic collections.                                                                                                      |
| G2 — initial/controlled ownership  | Resolved defect                              | Defined `[value]`, including `[]`, owns selection. `(valueChange)` supports two-way binding. Uncontrolled defaults are a one-time silent snapshot; later defaults do not reset selection. Uses the established Tabs input/derived-value/uncontrolled-value seam. U covers precedence, external changes, refused requests and late defaults; B covers controlled refusal and conflicting defaults.                                                                                                                                                             | Controlled/uncontrolled ownership changes across hydration lifetimes; paired React hydration remains unverified.                                                              |
| G3 — request transaction           | Resolved defect                              | Item emits first, then Root, then an accepted uncontrolled commit/`valueChange`. Both callbacks share details and the native event. Item veto prevents Root notification; Root veto prevents commit. External values and single-mode sibling closure do not synthesize Item callbacks. U, B cover opening/closing vetoes, controlled refusal and callback order/count.                                                                                                                                                                                        | Broader nested-Root and programmatic composition comparisons.                                                                                                                 |
| G4 — Trigger activation            | Present, scoped B                            | Composes owned Button behavior. Native host inference replaces React's `nativeButton` flag. Default native type is button; authored submit/reset are supported. Effective Root/Item/local disabled uses native disabled for buttons and ARIA/-1 tab order for non-native hosts. Normal Tab order, Enter/Space, consumer native default prevention and authored submit are compared. U, B.                                                                                                                                                                     | Anchor-specific, repeat/blur and consumer propagation scenarios for Accordion composition; Button's own suite is not an Accordion certification.                              |
| G5 — complete Panel view ownership | Resolved ownership defect, scoped B          | Required `*rdxAccordionPanelPresence` owns the full embedded Panel view through shared Presence and the Item Collapsible lifecycle. Initially closed children are absent, completed exit destroys components/subscriptions, and reopening creates fresh state. Retained/findable views preserve state. Native Collapsible detachment is disabled for the matching structural owner. Thirteen new U; eight new B; focused SSR and two client hydration regressions (G9).                                                                                       | Nested/reparented hydration remains unverified. Remaining motion combinations are tracked in G9.                                                                              |
| G6 — search reveal                 | Resolved same-task keyframe defect, scoped B | beforematch uses Item → Root cancellation and suppresses both motion durations before native hidden removal/measurement. Authored values/priorities return on close, refused controlled reveal, search-policy removal and destruction. Twenty-two new B cover transition/keyframe reveal, synchronous controlled acceptance/refusal, both veto levels, repeated search, later motion and native input retention. Firefox native find and all-engine fragment navigation emit trusted events. U covers same-task style suppression and cleanup.                | Native toolbar search in Chromium/WebKit; decorated/delayed keyframes and nested match navigation. One exact reviewed pin difference: keyframe fragment match visibility.     |
| G7 — part IDs and policy overrides | Present, scoped B                            | Trigger IDs register/reactively update/unregister. Native Panel exposes id; structural PanelPresence options own tri-state keepMounted/hiddenUntilFound, including explicit false and override removal. Generated IDs survive native view recreation through Item identity; part destruction clears controls. U, B cover conditional replacement, native relationships and retention precedence.                                                                                                                                                              | Broader authored-ID edits, multiple part replacement and hydration combinations.                                                                                              |
| G8 — exact state surface           | Partial, settled-state defects resolved      | Trigger has `data-index`, including zero. Item/Header/Trigger inherit orientation/hidden state; Header and Panel expose closed state. Closed findable Panels retain `data-starting-style`, as the actual pin does. B compares all public `data-*` on retained closed/open/findable/disabled parts; U covers index/order and state.                                                                                                                                                                                                                            | Broader animated attribute sequencing and dynamic index comparisons; motion cases compare explicitly settled phases rather than timing-dependent frame counts.                |
| G9 — measurement/motion/hydration  | Present protocol, scoped evidence            | Panels measure scrollHeight/scrollWidth, expose pixels during motion and auto on completion. Close captures current content before ending styles; shared lifecycle owns observation and cancellation. Initial-open keyframes and starting styles are suppressed in SSR and client markup. Ten new paired motion scenarios cover geometry, dynamic content, axes, switching, interruption and search. Two Angular hydration cases check server nodes/IDs/edited inputs, reverse islands, default disposal, retention and later animation across three engines. | Size keyframes combined with padding, additional author-style changes, zoom/writing modes, nested/reparented hydration and delayed hydration during motion remain unverified. |
| G10 — regression infrastructure    | Present, scoped coverage                     | 64 paired scenarios run through pnpm test-parity accordion: 172 passing comparisons and 20 native-find capability skips. The public Accordion behavior spec is registered in affected/full browser selection, including reverse Collapsible/Presence dependencies.                                                                                                                                                                                                                                                                                            | Native toolbar search in Chromium/WebKit, remaining motion/hydration combinations and broader native interaction scenarios.                                                   |

## Public parts and defaults

Root, Item, Header, Trigger and Panel remain exported from the Accordion entry.

| Contract                       | Current Angular behavior                                                                                                        | Evidence/limit                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Root `value`                   | Array in both modes, empty by default; supplied array owns selection.                                                           | U, B. Breaking migration: scalar `'one'` → `['one']`.                             |
| Root `defaultValue`            | Initial-only array; never overrides controlled selection.                                                                       | U, B.                                                                             |
| Root `multiple`                | False; affects requests without reinterpreting the array shape.                                                                 | U, B.                                                                             |
| Root `onValueChange`           | `{ value: unknown[], eventDetails }`, before commit, cancelable.                                                                | U, B.                                                                             |
| Root `valueChange`             | Accepted request array; supports `[(value)]`.                                                                                   | U. Controlled rejection keeps rendered selection unchanged.                       |
| Item `value`                   | Arbitrary identity; stable fallback for omitted/nullish values.                                                                 | U. No JSON serialization equality.                                                |
| Item `onOpenChange`            | `{ open, eventDetails }`, cancelable request before Root.                                                                       | U, B. No derived-state notifications.                                             |
| Trigger local props            | `id`, composed `disabled`, `type`, `tabIndex`, `role`; native host inferred.                                                    | U, B for button/span subset.                                                      |
| Trigger/Panel relationships    | Open-only controls; Panel region labelled by registered Trigger.                                                                | U, B; authored IDs included.                                                      |
| Root/Panel mounting policy     | Root defaults false; structural options override reactively, including explicit false. Findable implies retained complete view. | U, B, SSR for default/retained/findable and conditional views.                    |
| Root `orientation`/`loopFocus` | Deprecated no-ops for focus. Orientation still exposes styling state.                                                           | U, B for normal Tab behavior; no roving navigation.                               |
| Panel CSS variables            | --accordion-panel-height/width alias measured Collapsible scroll sizes during motion and auto after completion.                 | B, SSR; geometry probes include padding/borders/transforms and horizontal motion. |

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
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=reverse-accordion-presence
node apps/radix-ssr-testing/hydration-audit/audit.mjs --skip-build --case=eager-accordion-retained
pnpm skills:build
pnpm agents:check
```

The [suite README](../../../apps/parity-testing/primitives/accordion/README.md) records scope and results:
**64 scenarios / 172 passing comparisons / 20 capability skips** across Chromium, Firefox and WebKit
on macOS/arm64; **80 Accordion + 16 Collapsible passing units**, with no skipped construction placeholders.
The G6 increment reruns these checks, library build, focused lint/formatting and `agents:check`.
The preceding lifetime/motion increment also passed **three focused SSR tests**, **six client hydration
checks**, **twelve Storybook behavior checks**, SSR/Storybook builds and consumer generation.
Browser observations and traces are written to `dist/parity-testing/accordion/results/` and retain
the reference digest and browser versions. Native find skips come from a plain-HTML capability probe,
independent of either fixture: installed Chromium/WebKit `window.find()` does not emit trusted
`beforematch`. Native fragment reveal is verified in all three engines; browser toolbar automation
remains unverified.

The G6 investigation confirmed a keyframe fragment-reveal defect in both implementations: suppressing
motion after native match measurement can leave the revealed text outside the viewport. Angular now
suppresses motion in the same `beforematch` task. The pin remains unmodified; one exact reviewed
exception records only `search-fragment-keyframe` → `browser match visibility.inViewport` as Angular
`true` / React `false`, across all three engines. Other attributes, requests, view state and later
motion remain compared. Same-task keyframe height is asserted on Angular and retained as raw evidence
for React. Immediate suppression is an Angular assertion: the pin can also lose its one-shot flag
when its commit trails the reveal-revert decision in WebKit. Both fixtures receive the same animation
finish action before settled reveal comparisons; temporary open-cycle duration/priority values stay
in raw observations, while refusal and later-close restoration remain paired checks. Transition
fragment visibility is asserted on Angular and retained as raw reference evidence; keyframe fragment
and Firefox native-find visibility stay paired checks. The remaining combinations are unverified,
not inferred defects.

Next implementation priorities are broader **G1 arbitrary identity differential cases** and
**G4 native host/keyboard edge cases**. G6 retains the native-toolbar and composition limits above;
G9 retains its explicit motion/hydration limits.

The geometry cases isolate padding/borders/transforms with opacity keyframes; the other motion cases
exercise height keyframes and height/width transitions. Combining decorated content-box padding with
size keyframes can feed a measured value back into layout and is not certified here. Motion checks
pause/finish actual browser animations and assert named phases; they do not compare arbitrary elapsed
frames. Initial diagnostic records for transformed rectangles and retained pixel values are saved in
`dist/accordion-motion-before/`. The client hydration cases are Angular regressions in the shared
hydration audit, not paired React hydration comparisons.
