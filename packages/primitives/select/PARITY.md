# Select — Base UI compatibility

Reference: `@base-ui/react` **1.9.0**, source checkout
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/select).
Audited on 2026-11-08; close-lifecycle, focus-policy and arbitrary-Value increments verified on 2026-11-09. The commit, rather than the moving documentation site or a local path, is the
reproducible reference. Its package version is 1.9.0; it is not the release tag itself.

This is an API/source audit with linked regression coverage, **not a certification of complete
behavioral parity**. A shared React/Angular differential runner now defines 90 scenarios:
78 desktop/dynamic/geometry cases in all three engines, eight tap cases in Chromium/WebKit,
and four native touch-gesture cases in Chromium (254 comparisons; 16 capability skips).
It checks this pin and records exact known differences ([runner documentation](../../../apps/parity-testing/primitives/select/README.md),
[ADR 0029](../../../docs/adr/0029-select-differential-behavior-checks.md)). Rows marked as gaps remain open.

Root and Item now accept an unconstrained `Value`, defaulting to `unknown`. Angular DI erases the
family generic; typed application wrappers link the option collection and selection. Explicit
`multiple` distinguishes an array-valued item from a selection collection (ADR 0028).
Select now exports its own `Label`, using shared core label behavior. `Arrow` now composes the shared Popper arrow renderer and Floating UI arrow geometry. It hides
during item alignment and returns in the anchored touch/pinch-zoom fallback.

| Contract                                           | Angular implementation                                                                                                                           | Evidence / remaining difference                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compound parts                                     | Root, Trigger, Value, Icon, Portal, Positioner, Popup, List, Item, ItemText, ItemIndicator, Group, GroupLabel, Separator, Backdrop, Label, Arrow | Same roles; `ScrollUpButton` / `ScrollDownButton` correspond to upstream ScrollUpArrow / ScrollDownArrow. Angular also exposes the legacy item-aligned positioning parts.                                                                                                                                                                                                                                                                                                                                              |
| `Arrow`                                            | `rdxSelectArrow`, composed from `RdxPopperArrow`                                                                                                 | `select-arrow.spec.ts`, `select-arrow.behavior.spec.ts`: placement, dimensions, states, logical sides, collision/uncentered visibility, item-aligned hiding, anchored touch fallback and cleanup. The fallback computes only arrow geometry with the shared Floating UI middleware; item-aligned popup coordinates remain owned by its positioner.                                                                                                                                                                     |
| `Value`, `Multiple` type parameters                | Generic Root, Item and value-change events; `unknown` defaults                                                                                   | `tools/typecheck/select`: strict AOT accepts typed single/multiple consumers and rejects ten invalid bindings. Specify the mode for TypeScript references; templates infer from typed bindings/callbacks. Angular DI does not check an independent child's generic against Root.                                                                                                                                                                                                                                       |
| Arbitrary item value types                         | Unconstrained Root/Item, descriptors, metadata and contexts                                                                                      | `select-arbitrary-values.spec.ts`, `select-values.behavior.spec.ts`, AOT and SSR: falsy values, Dates, symbols, functions, single/multiple arrays, native submission/reset and autofill. Shared null-safe equality and explicit-mode serialization are recorded in ADR 0028. **Migration:** unparameterized references use unknown; an array in single mode is one item.                                                                                                                                               |
| `multiple`                                         | One Root; single value or array according to the mode                                                                                            | `select-typed-wrapper.spec.ts`; Angular boolean attribute coercion is retained.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Empty value                                        | Single initializes to `null`; multiple initializes to `[]`                                                                                       | `select-parity.spec.ts`: initial values, explicit controlled null, one-time defaults and native reset. **Migration:** empty uncontrolled models no longer initialize to `undefined`.                                                                                                                                                                                                                                                                                                                                   |
| `value`, `defaultValue`, `open`, `defaultOpen`     | Signal models, one-time defaults                                                                                                                 | `select-attributes.spec.ts`, `select-open-change.spec.ts`. **Adaptation:** Angular model bindings do not reproduce React's controlled-prop ownership exactly; use the cancellable event to veto an update.                                                                                                                                                                                                                                                                                                             |
| `onValueChange`, `onOpenChange`                    | `{ value/open, eventDetails }` outputs                                                                                                           | `select-open-change.spec.ts`; Angular outputs take one payload instead of two callback arguments. Reasons, cancellation and originating events are retained.                                                                                                                                                                                                                                                                                                                                                           |
| `onOpenChangeComplete`                             | Boolean output after the opening transition or completed close                                                                                   | `select-open-change.spec.ts`, shared lifecycle and action tests. Ordinary closing waits for disposable Presence views; a manual hold delays close completion until `unmount()`. Repeated completion actions do not emit another event.                                                                                                                                                                                                                                                                                 |
| `disabled`, `readOnly`, `required`, `name`, `form` | Primitive/form bindings and native serialization                                                                                                 | `select-forms.spec.ts`, `select-typed-wrapper.spec.ts`. Angular Forms owns form state.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `itemToStringLabel`, `itemToStringValue`           | Callbacks preserve `Value`                                                                                                                       | AOT contract; object labels, submitted values and reset covered by wrapper tests.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `isItemEqualToValue`                               | Typed callback or legacy property key                                                                                                            | `select-parity.spec.ts`: object reference identity, `NaN`, signed zero, callback comparison for strings. **Migration:** default is now `Object.is`; the property-key comparator remains an Angular extension.                                                                                                                                                                                                                                                                                                          |
| `modal` and positioning                            | Modal/non-modal, Popper and item-aligned positioning                                                                                             | `apps/visual-regression/tests/select.behavior.spec.ts`; this does not establish every mobile/browser combination.                                                                                                                                                                                                                                                                                                                                                                                                      |
| Keyboard navigation and focus                      | Virtual highlight model; Popup `closeOnFocusOut` opt-in, default `false`                                                                         | `select-focus-manager.spec.ts`, shared manager/scope tests, `select-focus.behavior.spec.ts`: Tab/Shift+Tab, cancellation, return focus, retained views, anchor movement and Dialog/Popover composition. **Gap:** default focus-out and item DOM focus still differ; real AT review is pending (ADR 0023 WS5 / ADR 0027). No full focus parity claim.                                                                                                                                                                   |
| `items` label lookup                               | Record, flat or grouped descriptors on Root                                                                                                      | `select-parity.spec.ts`, `select-items.behavior.spec.ts`: labels before mount / after close, live updates, precedence and null labels. **Adaptation:** labels are text, not React nodes; record lookup requires own properties, including the null label. **Migration:** mounted item text no longer determines the Value label. Application wrappers still own option rendering.                                                                                                                                      |
| `highlightItemOnHover`                             | Boolean Root input, default `true`                                                                                                               | `select-parity.spec.ts`, `select-items.behavior.spec.ts`: disabled hover preserves keyboard highlight through pointer move/leave; pointer selection works; enabled hover highlights and clears on leave.                                                                                                                                                                                                                                                                                                               |
| `Label` and control `id`                           | `rdxSelectLabel`, Root `id`, Trigger override                                                                                                    | `select-label.spec.ts`, `select-labels.behavior.spec.ts`, SSR rendering: names/focus, dynamic ids, native labels, container and same-host roots, Field interaction states. Shared core registration is also used by Field, Combobox and Autocomplete (ADR 0024). **Adaptation:** removing a label restores the preceding live registration.                                                                                                                                                                            |
| `autoComplete`, `inputRef`                         | `autoComplete`, callback `inputRef`, readonly `nativeInput()`                                                                                    | `select-autofill.spec.ts`, shared native-form-control tests, three-engine browser native-forms tests and SSR: synthetic autofill by serialized value / labels, hidden closed mounting, canceled/locked changes, scalar/repeated submission, required checks, focus redirect and ref cleanup. **Adaptation:** callback refs and a signal; generated input appears after hydration. Angular validators / Field own application validation state. Real saved-profile autofill and real-device coverage remain unverified. |
| `actionsRef` and deferred unmount                  | Root `close()` / `unmount()`; per-close opt-out; Portal `keepMounted`                                                                            | `popup-lifecycle.spec.ts`, `select-actions.spec.ts`, AOT fixtures and `select-actions.behavior.spec.ts`: cancelable imperative reason, held exit, single completion, batched actions, keep-mounted view, late-hook and reopen safety, inert closed content and focus. **Adaptation:** Angular template/view references replace a React ref; model writes are Angular-owned. Shared lifecycle and Presence integration are recorded in ADR 0026.                                                                        |
| Typed application wrapper                          | Extends Root and rebinds providers with `provideRdxSelectRoot`                                                                                   | `select-typed-control.ts`, `select-typed-wrapper.spec.ts`, AOT fixtures and browser tests. This is an Angular integration, not a new primitive model.                                                                                                                                                                                                                                                                                                                                                                  |

## Disabled-option navigation

ArrowUp/ArrowDown and Home/End now highlight disabled options, matching the pinned reference. Enter,
Space and pointer activation leave the value and popup unchanged for a disabled item; typeahead
continues matching enabled options only. This uses the existing shared `useListHighlight` predicate;
navigation eligibility and selection eligibility remain separate caller policies. The Angular virtual
focus model is unchanged.

**Migration:** arrow navigation no longer skips disabled options. A selected disabled option can
also be highlighted on open. `select-navigation.spec.ts` covers selection guards, ARIA, boundary
stopping, all-disabled lists and live disabling/removal. Differential scenarios check disabled
boundaries, unchanged callbacks/form data and enabled-only typeahead cycling; the
`disabled-item-navigation` exception category is removed.

## Typeahead

The Angular highlight model matches the pinned reference for open-popup search: a
750ms session, selected-item origin (active item if nothing is selected), multiword prefixes, repeated
initials and double-letter labels, immediate miss recovery, and index-based matching for duplicate
labels. Space extends an active query and commits only when idle. A Space on a disabled item retains
the reference's uncommitted search session. Opening, selected-index changes while open, form writes,
and leaving the composite reset the session, including retained views. A late placement notification no
longer overwrites a newer search/highlight after reopening a retained view.

The pure `findTypeaheadMatch` utility in core is used by both Select and Menu. Root owns the shared Trigger/Popup session
and Angular effect/DestroyRef cleanup; Menu retains its existing timeout and focus policy. There is
no controlled-value mirror or React store. `select-typeahead*.spec.ts` and eleven differential cases
cover this increment; `select-typeahead.behavior.spec.ts` drives the new Storybook example.

**Migration:** the open search timeout changes from 1000ms to 750ms. Space inside a query continues
the label instead of selecting immediately. Search after arrows starts after the selected value, and
identical labels are no longer collapsed onto the first item. No new application input is required.

Closed-trigger typing now selects in single mode with reason `none`, through the usual cancelable
Root value event, CVA/Signal Forms and native serialization. It leaves popup state and trigger focus
unchanged. Disabled/read-only/multiple modes reject it. Root shares lazy option resolution with
autofill; projected metadata is read in live DOM order with explicit `textValue` or current ItemText.
Rapid keys queue across the first render; stale work is discarded on blur, opening, reset, mode change
or destruction. Focus alone does not mount the Angular view. Temporary query views remain hidden
and inert until timeout/blur, respecting `keepMounted`. No selection mirror or React ref/store is used.

`select-closed-typeahead.spec.ts`, form integration regressions, ten closed differential scenarios and
the updated browser demo cover the increment. Hidden-view lifetime/inert differences remain explicit
exceptions; values, cancellation, callbacks and open state match. Default focus-policy and real-AT
gates remain open.

## Desktop browser verification

Every differential scenario now runs in Chromium, Firefox and WebKit. Exact expected differences
remain unchanged across engines. The report records browser versions and host platform separately;
the desktop increment was verified on macOS arm64, and CI runs the same projects on Ubuntu 24.04.
`pnpm test-browser:select` additionally reuses all Select Storybook behavior checks across those
engines, including native form constraints/submission, synthetic autofill, labels, focus scopes,
deferred exits, Arrow and item-aligned positioning. Screenshot baselines keep their existing config.

Logical close resets the query even without a native blur event. An enabled item receives pointer
highlight on a press even if WebKit reports no initial pointer delta. The first genuine pointer move
also resumes hover after keyboard navigation. The scroll guard covers stationary pointer-leave
events in Chromium and Firefox too; read-only prevents selection. Root's accepted
open/close transaction and Angular model effect own search reset, while item events update the
existing highlight model. No focus-policy default or item DOM-focus change is included.

Core's viewport-coordinate pointer guard distinguishes real travel from zero-delta stationary
scroll events. The shared native-form bridge defers reset until after dispatch/default action, so
bubbling cancellation remains authoritative in WebKit too. Its other consumers' unit checks wait for
this same native-reset boundary; their selection models are unchanged. The arbitrary-value demo uses
element-bound readout text to survive WebKit replacing `<output>` children on native reset (ADR 0025).

Desktop WebKit automation does not certify real Safari/device behavior or screen-reader output.
Saved-profile autofill also remains unverified; synthetic browser input events test only the bridge.

## Modal, item-aligned and RTL comparisons

Thirteen differential scenarios extend the desktop checks to modal selection/Escape, background hit
blocking versus non-modal activation, canceled outside closing, scroll lock/release, trigger toggling,
item alignment and realignment after selection in LTR/RTL, viewport-resize dismissal, explicit RTL
start alignment, and the implicit anchored alignment default. Each fixture sets its native document
direction and framework direction provider before bootstrap; these are whole-page RTL checks.

Layout assertions use the same 2 CSS-pixel alignment tolerance and viewport bounds on both sides.
Raw rectangles/deltas remain in the report. Scroll checks use real wheel input before/after close;
background activation is counted from native clicks, including coordinate clicks through the actual
backdrop hit area. These assertions do not force component state, focus or lifecycle completion.

The increment corrects Trigger pointer toggling and duplicate outside-close requests after keyboard
opening. A pending pointer origin starts as null and is cleared on logical close; keyboard opening
does not invent a pointer gesture. The ordinary close/reopen typeahead scenario waits for close
completion; the existing deferred fast-reopen scenario still tests cancellation of pending completion.

**Migration:** the anchored Positioner default changes from `start` to Base UI's `center`. Set
`align="start"` explicitly to retain edge alignment. The separate item-aligned positioner is unchanged.

One additional difference is recorded explicitly: after an outside request is canceled, the pinned
React implementation reports both `pointerdown` and compatibility `mousedown` requests; Angular's
native pointer pipeline reports one request per gesture. The exact canceled event sequences are
reviewed exceptions (`canceled-compatibility-press`); state, values, background blocking and scroll
lock still have shared assertions. Existing virtual-focus and closed-view-retention exceptions apply.
Real-device/touch and screen-reader gates remain open.

## Browser bridge decision

The technical input supports HTML form behavior, independent of the framework. Angular CVA and
Signal Forms connect the primitive value to Angular without requiring this input. Select's current
button/popup anatomy needs a native representation for browser autofill and native constraints.
Reuse an existing native control when it represents the submitted value. Prefer Select's readonly
`nativeInput()` signal for Angular access; callback `inputRef` adapts the Base UI name.

[ADR 0025](../../../docs/adr/0025-separate-angular-forms-from-browser-input-bridge.md) records the decision
to retain the current bridge, ownership boundaries and migration implications.

## Dynamic options and emulated touch

Eleven differential scenarios cover insertion, removal, reordering, disabled/renamed options,
multiple selection, initial-value fallback, cancellation and replacement object instances with
explicit key equality. The Storybook **Dynamic Options** example exposes live changes through
F2/F3/F6 while the popup keeps focus. `select-dynamic-options.spec.ts` and its browser behavior
spec cover reconciliation and usable navigation after changes.

**Migration:** removing a selected option from an already populated open list now requests a
cancelable value change with reason `none`. Single mode returns to the initial selection when it
is still available, otherwise `null`; multiple mode removes missing values. Closing/unmounting,
an initially empty collection and its first load do not clear selection. A completely empty
collection is not reconciled, matching the reference's current guard. This increment does not
claim closed/unmounted collection reconciliation.

Selection reconciliation runs after Angular finishes rendering/collecting options. It shares
Root's existing value commit path and form notifications. No React store or mutable current-value
mirror is introduced. The only initial-selection snapshot supplies the defined fallback.
`dynamic-highlight-identity` records a deliberate difference: Angular preserves a highlighted
element during reorder and clears it when removed; the pin can move highlight to another ordinal
or reset it to the selected item. Exact values, callbacks and form entries still match. Native
focus after a focused item is removed varies by engine; those exact pairs are engine-scoped.

Touch contexts use trusted Playwright taps in Chromium/WebKit, plus public Chromium CDP input
for cancel and pan gestures. Coverage includes disabled/read-only states, multiple toggles,
outside modal/nonmodal taps, item-alignment fallback, trigger pan/cancel, option cancellation and
list scrolling without committing a value. Reports retain input mode, trusted native input events,
geometry and explicit capability skip reasons. Firefox has no Playwright `hasTouch` support;
WebKit has no public equivalent of CDP touch move/cancel. The viewport remains desktop-sized.

WebKit touch tests found missing backdrop compatibility mouse events. The common internal backdrop
now opts into the native click sequence; dismissal keeps its shared touch timing. Select preserves
touch highlight through the ensuing pointer leave and ignores touch motion for mouse hover.
These checks do not validate real iOS/Android behavior or screen-reader interaction.

## Viewport and scroll-container geometry

Thirteen new differential scenarios cover long lists near the top/bottom/right edges, middle and
RTL alignment, `overflow` clipping, scrolled parents, custom portal containers and scroll-arrow
start/stop. Native wheel input changes the ancestor before opening and verifies that an anchored
popup follows a moving trigger while open. Anchored custom portals also exercise a transformed
containing block. Item-aligned custom portals currently use an untransformed container.

Common assertions require viewport containment, a usable list, visible selected/highlighted items,
correct Home/End selection and unchanged form/event contracts. Selected text aligns within 2 CSS
pixels in the interior. At the RTL viewport edge, horizontal clamping takes precedence; the actual
text delta is retained. Rectangles, scroll offsets and native hover movement are recorded. These
checks do not assert identical popup dimensions, margin constants or expansion curves.

Keyboard scrolling now belongs to Popup alone, using the shared `resizeEffect` with Angular
cleanup. A resize of the list rechecks the active item: newly visible in-flow scroll buttons can
otherwise cover the End target. Boundary items scroll through list padding to the actual start/end.
The redundant unconditional scroll effect in each scroll button is removed, so hover/touch highlight
cannot independently move the list. The common resize helper tolerates missing browser APIs.
The **Viewport Edges** story and `select-geometry.behavior.spec.ts` guard these layouts in all engines.

**Recorded reference gap:** `reference-webkit-hover` is scoped to the hover checkpoint in WebKit:
Angular scrolls after native mouse travel, while the pin rejects zero `movementX/Y`. The exact
`listScrolled: true/false` pair is recorded separately from focus; values/events stay comparable.
The same guarded handler leaves the reference's `item-0` highlight active; that exact pair is
scoped to the same engine/checkpoint too.
Angular's WebKit hover/stop behavior remains required by the Storybook test.

**Still open:** the legacy item-aligned algorithm differs in sizing, scroll expansion and edge
fallback from Base UI. A transformed custom container exposes incorrect item-aligned geometry in
both implementations at this pin; this remains a tracked gap, not a passing geometry scenario.
Changing container scroll _while item-aligned mode is open_, real pinch zoom and mobile visual
viewport movement also need further differential/device evidence.

## Next parity increments

| Order | Work                             | Shared boundary / completion evidence                                                                                                                                                   |
| ----- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Default focus policy / real AT   | Browser coverage and opt-in are available (ADR 0027). Compare virtual vs item focus and run the documented real-screen-reader scenarios before changing the default.                    |
| 2     | Behavioral equivalence           | 90 pinned scenarios include viewport/scroll/clipping constraints. Next: item-aligned sizing/expansion and transformed containing blocks, then closed/unmounted data changes (ADR 0029). |
| 3     | Real devices and native autofill | Desktop automation covers the bridge and Storybook modes. Verify real Safari/devices, saved-profile autofill and assistive technology separately.                                       |

Rows with an implemented API still carry the verification limitations listed above. Completing a part
or a shared helper does not certify complete behavioral parity.

## Reproduce the pilot checks

```bash
pnpm test-parity:select
pnpm test-browser:select
pnpm exec nx run primitives:typecheck
pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/select/__tests__
# With Storybook running on :4400:
pnpm exec playwright test -c apps/visual-regression/playwright.config.ts select.behavior
```

The AOT fixtures intentionally keep negative cases outside the library build. The checker fails if a
valid consumer stops compiling, an expected type error disappears, or an unrelated diagnostic appears.
CI runs this checker as part of the primitives `typecheck` target.

The next parity changes should close specific rows with their upstream scenarios and a migration note
where existing behavior changes. They must not silently turn a source-audit row into a claim of full
browser or assistive-technology equivalence.
