# Accordion pinned comparisons

Run `pnpm test-parity accordion` (or add `--project=chromium` for iteration).
The suite is discovered automatically by the shared runner and CI selection. It compares independent
Angular and React fixtures against the exact source in `../../reference.json`; no recording adapter
synchronizes the implementations.

## Current scope

**93 scenarios, 259 passing comparisons and 20 capability skips** across Chromium, Firefox and WebKit on macOS/arm64,
2026-11-18, against Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
There is **one exact reviewed difference**, described below. Capability skips apply only to native
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

## Search reveal difference

The `search-fragment-keyframe` case reveals a confirmed same-task geometry defect in the pin:
it suppresses keyframes after the browser has already measured/scrolled to the match. The revealed
text remains outside the viewport in Chromium, Firefox and WebKit. Angular now suppresses both motion
durations in `beforematch`, before native `hidden` removal. It restores both authored inline styles
on close, refused controlled reveal, policy removal or destruction.

`expected-differences.json` records only `browser match visibility.inViewport`: Angular `true`,
React `false`, for that one scenario. Callback, attribute, lifetime and later-motion differences are
not exempted. Same-task keyframe height is also asserted on Angular and retained as raw evidence for
the pin; elapsed animation frames are not compared.

Immediate motion suppression is asserted on Angular. The pin can also lose its one-shot suppression
when its commit trails the reveal-revert decision in WebKit. Its duration, priority and running motion
are retained as raw observations. The driver finishes any remaining animations with the same action
on both fixtures before comparing settled reveal state; temporary open-cycle style values are excluded
only from those two settled checkpoints. Authored values/priorities on refusal and later close remain
paired assertions. Transition fragment visibility is asserted on Angular and retained as raw evidence
for React, since a lost suppression flag can also change its scroll result. The keyframe fragment
visibility difference and Firefox native-find visibility remain paired checks. This is not a
certification of the pin's immediate motion sequencing.

## Other validation

- **80 Accordion unit tests**, no skipped placeholders; **16 affected Collapsible unit tests**.
- G1 reruns the 80 Accordion units, the complete paired suite, Angular fixture AOT compilation and
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
