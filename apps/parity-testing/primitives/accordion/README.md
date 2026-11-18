# Accordion pinned comparisons

Run `pnpm test-parity accordion` (or add `--project=chromium` for iteration).
The suite is discovered automatically by the shared runner and CI selection. It compares independent
Angular and React fixtures against the exact source in `../../reference.json`; no recording adapter
synchronizes the implementations.

## Current scope

**185 scenarios, 535 passing comparisons and 20 capability skips** across Chromium, Firefox and WebKit.
The latest complete run is Linux/arm64, 2026-11-18, against Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
There is **one reviewed visibility field**, scoped to Chromium and WebKit. Capability skips apply only to native
`window.find()` reveal on Chromium and WebKit; their plain-HTML probes do not emit trusted `beforematch`.

- Single/multiple array requests, switching siblings, Item-first/Root-second callback order and
  shared details/native event identity.
- Controlled rejection, conflicting defaults, Item/Root veto on opening and closing.
- Button/span Enter and Space, effective Root/Item/Trigger disabled, normal Tab order,
  native default prevention and an authored submit type.
- Authored IDs, open-only controls, Panel labels and all public state attributes on retained
  closed/open/disabled/findable parts, including index zero and persistent search starting style.
- `beforematch` acceptance, Item/Root veto, controlled refusal and closing a single-mode sibling.
  The original cases dispatch the event and emulate the browser removing `hidden`.

- Eight whole-Panel lifetime cases cover default child-view disposal, retained/findable state,
  interrupted exit, Root disposal, override removal, keyed reorder/removal and conditional Panel return.
  Native input state, child creation/destruction and relationships are compared. Exit scenarios
  declare enter CSS before first opening because the pin discovers motion type on open.

- Ten motion cases compare scroll-based dimensions with padding/borders/transforms, height and width
  transitions, dynamic content, initial-open keyframes, later opening, sibling switching, rapid reopen
  and transition-based beforematch reveal. Animations are paused/finished through the browser API;
  pixel sizes, completion auto values, phase attributes and same-task search geometry are observed.

- Twenty-two search cases cover height transitions and height keyframes, Item/Root veto, controlled
  refusal and synchronous controlled acceptance. They check callback order/count/details,
  hidden-state restoration, later close, ordinary opening, repeated search and native input
  preservation. Authored inline duration values and `!important` priorities return before closing.
  Ten cases use synthetic events in all engines. Ten use Firefox's native `window.find()` operation,
  with trusted `beforematch`, selected match text and viewport checks on accepted requests; they do
  not automate the browser toolbar. Two use native fragment navigation in all engines. Neither
  native path dispatches events or removes `hidden` in the driver. A plain-HTML capability probe,
  independent of either fixture, records why native find is skipped on the other engines.

- Twenty-nine identity cases cover reference-equal and structurally equal objects, circular objects,
  functions, nested/empty arrays, Symbols, falsy values, number/string/bigint distinctions, Infinity,
  NaN and signed zeros. Both modes cover nullish/generated values, shared references, frozen duplicate
  defaults, accepted/refused controlled reference updates, live Item value replacement and keyed
  collection insertion/movement/removal/recreation. A live mode switch preserves the existing array.
  Root state comes from the Angular exported directive or React Root render state, independently of
  callback traces. Native host/ID identity, input state and dynamic indices are checked too.

- Ninety-two activation cases compare native buttons, spans and anchors with/without href. They
  cover Enter/Space phases, repeat, blur, template and later native handler prevention, enabled
  ancestor propagation, child click/key targets, modifiers, pointerdown focus preservation, each
  disabled owner during a held Space press, submit/reset defaults and normal Tab/Shift+Tab order
  without Arrow/Home/End navigation. Root/Item requests retain the click event, shared details and
  exact request count/order, native trust/detail/modifiers and form submitter identity.

The driver retains raw DOM, native events, callback traces and reference digest; it excludes only
Angular's internal `data-rdx-*` identity bookkeeping from the public styling attribute comparison.
Generated IDs are checked by native relationships rather than comparing framework-specific strings.

The original 24 scenarios explicitly retain Panels; the eight lifetime scenarios compare default
unmounting as well as retained/findable policies. They establish complete child-view disposal and
native state reset/preservation, with no accepted exceptions. The motion cases add measured CSS-variable and phase evidence. They do not certify every author-style
combination or arbitrary frame timing. Native browser toolbar search in Chromium/WebKit remains
unverified. Basic client hydration has separate
Angular-only evidence in the shared hydration audit. Remaining
contracts are in [Accordion PARITY.md](../../../../packages/primitives/accordion/PARITY.md).

## Identity observation protocol

Reference tokens identify exact fixture values through `Object.is`; callback arrays keep their
outer shape and order. This preserves distinctions that JSON serialization would lose (functions,
Symbols, bigint, NaN, signed zeros and circular objects). Unknown references fail explicitly. Only
generated fallback strings get encounter-order tokens, so a changed fallback cannot pass as the old
value after a keyed move. Native node references and original part IDs are captured separately; they
must survive moves and change on recreation. Initial/default/accepted controlled arrays are frozen.

The cases also record the pin's numeric boundary: `includes` opens NaN, but strict equality in close
requests does not remove it. Signed zeros share membership/removal even though payload tokens retain
the sign. Shared values open every matching Item without synthesizing sibling callbacks. Removing an
Item leaves its selected reference in Root; recreation with that explicit reference opens the new
Item, while a recreated nullish Item gets a new fallback. These cases have no differential exceptions.
Identity changes during animated exits/hydration and nested dynamic collections remain unverified.

## Activation observation protocol

The independent fixtures compose the actual Accordion Trigger and its Button behavior. They expose
consumer callbacks, Item/Root requests, enabled ancestor callbacks, native form effects, URL hash and
focus. Named keydown/repeat/keyup checkpoints prove activation phases and counts. Disabled Root, Item
and local Trigger updates occur between press and release, followed by successful reactivation.
A focusable descendant of a span keeps its keys; pointer events retain the real child target.

Template consumers run before Item then Root; enabled template ancestors receive uncanceled
propagation afterward. Later native host listeners independently verify `preventDefault` ordering.
Click default prevention stops navigation while leaving the selection request enabled. Space
keydown prevention suppresses native button activation; non-native Space release remains enabled
unless keyup itself is prevented, matching the pin. Both behaviors are explicit assertions.

A plain-HTML anchor probe runs in an independent page, without either implementation. It records
trusted Enter clicks and repeat key targets before the held-link case runs. Each engine's native
repeat policy is preserved; generated keyboard clicks are also checked for trust, detail and
modifiers. The probe evidence is retained in the scenario measurements, with no capability skips
or differential exceptions added for these cases.

This scope does not certify live host/href/role replacement, external native ancestor listeners,
React-only event extensions, controlled/multiple combinations or real devices/AT.

## Search reveal difference

The `search-fragment-keyframe` case exposes how the pin can suppress keyframes after the
browser scrolls to the match. Chromium and WebKit leave the revealed text outside the viewport.
Firefox has produced both outcomes with the same fixture. Angular suppresses both motion
durations in `beforematch`, before native `hidden` removal, and restores the authored inline
styles on close, refused controlled reveal, policy removal or destruction.

`expected-differences.json` records the exact `browser match visibility.inViewport` pair
(Angular `true`, React `false`) for Chromium and WebKit. Angular must still reveal the match in
Firefox, and the report preserves the raw geometry for both fixtures. Callback, attribute,
lifetime and later-motion checks still run on all engines. Same-task keyframe height is
also asserted on Angular and recorded for the pin.

Immediate motion suppression is asserted on Angular. The pin can also lose its one-shot suppression
when its commit trails the reveal-revert decision in WebKit. Its duration, priority and running motion
are retained as raw observations. The driver finishes any remaining animations with the same action
on both fixtures before comparing settled reveal state; temporary open-cycle style values are excluded
only from those two settled checkpoints. Authored values/priorities on refusal and later close remain
paired assertions. Transition fragment visibility is asserted on Angular and retained as raw evidence
for React, since a lost suppression flag can also change its scroll result. Firefox native-find
visibility remains a paired check.

## Other validation

- **80 Accordion unit tests**, no skipped placeholders; **16 affected Collapsible unit tests**.
- G1 and G4 rerun the 80 Accordion units, the complete paired suite, Angular fixture AOT compilation and
  production build, focused lint/formatting and agent documentation checks.
- The G6 increment reruns these units, the paired suite, library build, focused lint/formatting and
  agent documentation checks. The SSR, hydration, Storybook and consumer evidence below comes from
  the preceding lifetime/motion increment.
- **Three focused Accordion SSR tests**, including array defaults, authored relationships and native
  disabled state, absent/kept/findable/open/controlled Panel views; unrelated SSR cases are filtered out.
- Four public Storybook scenarios pass in Chromium, Firefox and WebKit (twelve checks): controlled array cancellation, multiple defaults, native view state and dynamic-content size transitions. The behavior spec participates in affected/full CI selection.
- Two real Angular hydration cases pass in three engines (six checks): reverse islands with default view disposal and eager retained views. They assert SSR node identity, edited inputs, IDs, first-paint suppression and later keyframe motion.
- Library, SSR application and Storybook production builds, public consumer-bundle generation, focused lint, formatting and agent documentation checks.

Reports are written to `dist/parity-testing/accordion/results/`, including browser versions,
observations, exact differences, failures and Playwright traces. The exact reviewed difference
cannot suppress untested behavior.

```bash
pnpm exec vitest run --config packages/primitives/vite.config.ts \
  packages/primitives/accordion/__tests__ packages/primitives/collapsible/__tests__
pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts -t 'Accordion|accordion'
pnpm exec nx run radix-storybook:build-storybook
pnpm exec playwright test -c apps/visual-regression/playwright.floating.config.ts accordion.behavior
```

Decorated geometry probes use opacity motion to keep dimension measurements independent of padding
feedback in size keyframes. Padding combined with height/width keyframes, live author-style changes,
writing modes/zoom, native browser toolbar search in Chromium/WebKit and nested/reparented hydration
remain unverified. Decorated/delayed keyframe reveal and nested match navigation are also outside G6's
current scope.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=reverse-accordion-presence
node apps/radix-ssr-testing/hydration-audit/audit.mjs --skip-build --case=eager-accordion-retained
```

## Native fragment scroll rounding

CI [44297021305](https://github.com/radix-ng/primitives/actions/runs/44297021305/job/134777095901)
failed both fragment search cases in Linux WebKit after the panel had successfully opened with
motion suppressed. The trace places the revealed text at the viewport edge with integer scroll
position 1291, but the old visibility assertion required an exact nonnegative fractional DOMRect top.
The original artifact is retained in `dist/ci-44297021305/accordion/results/`.

The search fixture now deliberately uses a 1200.5px spacer. With the old assertion, both cases fail
on macOS WebKit: the correctly revealed match starts at -0.1796875 CSS px after native scroll rounding.
The visibility observation allows one CSS pixel at the viewport edges, equally for both fixtures.
Raw top/bottom/height, scroll offset, viewport, font readiness and tolerance are retained even if the
assertion fails. No scroll position, event, primitive state or motion is changed by the observer.

The approximately 78px keyframe miss observed in that run exceeds the new tolerance. Native
`beforematch`, request/cancellation, retained input and later motion assertions remain in place.
Browser zoom and unrelated geometry combinations remain outside scope.

The complete Linux/arm64 suite passes 535 comparisons with 20 existing capability skips in Playwright
1.60.0 Noble, Node 24.22.1, two workers and original timeouts. All 22 search scenarios pass twice in
three macOS engines: 92 comparisons and 40 existing capability skips. Angular fixture AOT/production
build, 96 Accordion/Collapsible units, focused lint/stylelint/formatting and contributor checks pass.
Before/after reports are retained under `dist/ci-44297021305/accordion/` and the normal suite output.
