# Select behavioral comparison

This runs the same Playwright actions against an Angular Select and an unmodified Base UI React
Select. It is a differential regression check with explicitly recorded differences, **not complete
behavioral parity certification**.

Use Node.js 24 (`nvm use`) and install workspace dependencies, then:

```bash
pnpm exec playwright install chromium firefox webkit
pnpm test-parity:select
```

Shared preparation, TypeScript tooling and commands are documented in the
[runner guide](../../README.md). The pinned reference is [reference.json](../../reference.json).

## What is compared

The 118 scenarios produce 338 comparisons and 16 capability skips: 106 desktop/dynamic/geometry/composition cases in
Chromium, Firefox and WebKit, eight touch-tap cases in Chromium/WebKit and four touch-gesture cases
in Chromium. They exercise
keyboard/typeahead, pointer/multiple selection, disabled/read-only states,
open/value/close cancellation, imperative close and deferred unmount/reopen, native form reset,
object/array values, Tab/Shift+Tab and focus outside. The default and opt-in Angular focus policies
are separate scenarios. Both fixtures use uncontrolled defaults and their real public actions.
Adapters record callbacks; they never synchronize values, focus, open state or lifecycle completion.

Checkpoints read the DOM, actual focus, ARIA links, mounted/visible/inert state, selection/highlight,
`FormData`, callback reasons, cancellation, completion order and original value types/references.
Generated ids, callback signatures, whitespace and serializable option identifiers are normalized;
actual focus targets and value types/references remain distinguishable. Native event types are retained
as separate evidence because React and Angular bind different DOM events for the same gesture.

Angular templates are checked with strict AOT before building. React's pinned TypeScript sources are
transpiled by Vite, as source fixtures; the runner does not patch upstream implementation/types or
claim to type-check the upstream project. Exact external dev dependency versions are in the root
lockfile. None of them becomes a consumer dependency of the Angular package.

Arrow/Home/End navigation now includes disabled options in both implementations. Shared assertions
cover disabled first/middle/last items, boundary stopping, blocked Enter/Space activation, unchanged
form values/callbacks, and typeahead cycling through enabled matches. Unit coverage additionally
checks pointer activation, dynamic disabling/removal, all-disabled lists and an already selected
disabled option. The remaining item DOM focus differences are still recorded as `dom-focus`.

## Recorded differences

`expected-differences.json` records exact Angular/React pairs for a specific scenario, checkpoint and
field, optionally scoped to one browser. Any new, changed **or disappeared** difference fails and requires review. Shared assertions
still apply to both implementations. The report preserves all raw observations even on failure.

- `reference-webkit-hover`: the pin ignores native hover moves with zero `movementX/Y` in WebKit.
  The hover checkpoint records the exact Angular `listScrolled: true` / React `false` pair; the
  reference also retains `item-0` highlight instead of clearing it on hover. Both fields are
  scoped to WebKit. The Angular Storybook hover check still has to pass. Native coordinates/deltas are retained.
- `transformed-alignment-fallback`: in the two transformed item-aligned cases, Angular uses the
  common anchored engine and stays in the viewport; the pin keeps item mode and overflows. Only
  exact `itemAligned` / `popupWithinViewport` pairs are excepted; keyboard selection and form events
  still match.
- `retained-view-safety`: the explicit Angular retained view is mounted/inert initially and keeps
  inert/highlight state after close, while the reference's ordinary Portal has different retention.
  These are exact DOM pairs, not claims of a reference keepMounted API.
- `dom-focus`: Angular focuses the popup and exposes virtual highlight; Base UI focuses an item.
  On removal of a focused option, Firefox/WebKit may leave native focus on body while Chromium
  focuses the replacement item. Those exact pairs are browser-scoped. Changing Angular's focus
  model remains gated on real assistive-technology review (ADR 0023 / 0027).
- `dynamic-highlight-identity`: Angular keeps highlight on the same live element during reorder
  and clears it when removed; the pin can reassign it by ordinal or reset to the selected item.
  This preserves Angular's existing shared highlight semantics. Actual DOM order and subsequent
  keyboard navigation are asserted; values/form data/callbacks are compared without exceptions.
- `default-tab-policy`: Angular's current default prevents Tab; Base UI closes on Tab/Shift+Tab.
  The opt-in Angular `closeOnFocusOut` scenario closes and restores focus correctly.
- `closed-dom-retention`: the reference keeps a hidden popup and selected option nodes after close
  or canceled opening; Angular releases that view. Logical state, visibility and form values are
  compared separately and cannot be hidden by this exception.
- `closed-options-inert`: Angular's hidden metadata view is inert while a closed query is active;
  the pinned reference does not set inert on that hidden surface. Visibility, focus, callbacks and
  form entries are compared separately. This retains Angular's existing closed-content safety rule.
- `deferred-exit-safety`: Angular makes held, logically closed content inert and the browser drops
  focus from it; the reference retains item focus without `inert`. During this held phase only,
  Angular focus may be `body` or `trigger` (browser inert/focus-guard scheduling). Both exact targets
  are recorded; any focus inside closed content or on another element fails. Angular retains its existing
  safety behavior (ADR 0026).
- `native-reset`: Angular restores the initial uncontrolled value on a native `form.reset()`;
  this standalone React Root retains its current value. No React Form/Field or Angular forms adapter
  is installed in these fixtures. Framework form integrations remain separate tests (ADR 0025).
- `array-item-label`: in this commit, Base UI Value branches on `Array.isArray(value)` even in single
  mode and renders a comma for an array-valued item. Angular respects explicit `multiple` and renders
  its item label (ADR 0028). Wire values and callback reference identity still match.
- `canceled-compatibility-press`: the pinned reference retries a canceled modal outside press for
  compatibility `mousedown` after `pointerdown`. Angular reports one cancelable request per pointer
  gesture. Only the exact canceled sequences are exceptions; accepted-close callbacks, values,
  background activation, open state and wheel scrolling remain checked against both implementations.

The pinned `Select.Portal` has no `keepMounted` prop. Equivalent-prop coverage is excluded. The sizing reopen case compares an explicit Angular retained
view to the reference's normal open/close path, with exact safety differences recorded; additional
Angular unit and Storybook checks still apply. The differential scope
now includes desktop anchored/modal/item-aligned modes, whole-page RTL, emulated touch, dynamic
data and the geometry constraints below. Pixel-identical sizing, animation timing and the remaining
geometry/device gaps are not certified by these comparisons. Additional
Angular Storybook checks run in all three engines via `pnpm test-browser:select`; they do not replace
differential evidence for the uncovered modes. Real devices, saved-profile autofill and actual screen
readers remain separate verification.

## Typeahead coverage and boundaries

`tests/typeahead.scenarios.ts` adds eleven pinned-reference comparisons for multiword labels, search
origin after arrows, Space on disabled items, immediate recovery from misses, repeated initials and
double-letter labels, duplicate labels, the 750ms timeout, close/reopen, read-only and multiple modes,
and the active-item origin with no selection. Shared assertions check actual highlight, value, open
state and form entries. No typeahead exception category is needed; only the existing DOM focus and
closed-view retention differences remain on these checkpoints.

The origin-after-arrows case pauses Playwright time after opening, advances 32ms per native key and
100ms per checkpoint, and retains those settings in the observations. Its intermediate Berlin
checkpoint cannot consume the 750ms query timeout on a busy runner before the cycling key arrives.
DOM assertions still read the real rendered state; the separate timeout scenario advances beyond 750ms.

Trigger and Popup share one ephemeral session owned by Root. The case-insensitive, indexed prefix
matcher is shared with Menu in core; Menu retains its own timeout and focus policy. Index matching
preserves distinct values when labels are equal. Unit coverage verifies exact timeout boundaries,
composition/modifiers, external form writes, focus leaving, live labels/order, and logical open/reset
with and without retained Angular views. A late positioner notification cannot overwrite an already
chosen keyboard highlight.

`tests/closed-typeahead.scenarios.ts` adds ten comparisons for selection without opening, rapid
multiword input, cycling, value cancellation, timeout/idle Space, blur, popup-to-trigger reset,
duplicate labels, disabled matching and read-only/multiple locks. No value/event/open-state
exceptions are needed. Native key events are retained by Angular; the reference creates generic
reason-`none` events, recorded separately as native-event evidence.

Closed reads share Root's on-demand option preparation with autofill. Focus alone does not mount the
Angular popup. The first query resolves projected item metadata after Angular renders, coalesces
pending keys, and reads current DOM order and explicit aliases/live ItemText. A temporary view stays
hidden and inert for the active 750ms session, then releases on timeout or blur; `keepMounted` is
respected. Opening, reset, disabled/read-only/multiple transitions, blur and destruction invalidate
stale pending keyboard work. Canceled requests leave values, native entries and form dirty state
unchanged. Reactive Forms, ngModel and Signal Forms have direct closed-query regression coverage.

The Storybook Typeahead demo supports both closed selection and open highlighting. Logical close
resets the query even when the browser removes the focused popup without a blur event. Explicit
pointer presses highlight enabled items even when WebKit reports a zero-delta first move; the first
genuine move resumes hover after keyboard input. Read-only still prevents selection. These fixes
pass the existing exact exceptions unchanged; no browser-specific value/focus exceptions were added.

Select's open scope uses the shared viewport-coordinate move guard, so actual zero-delta travel is
recognized while stationary cursor/list scrolling remains filtered. Storybook checks also exercise
native reset cancellation in all engines; the common form bridge waits until dispatch/default action
finishes, and demo `<output>` readouts bind the live element rather than text nodes replaced by WebKit.

Keyboard tests
wait for actual focus inside a visible popup before sending open-list keys, without forcing focus or
changing state; snapshots still record the exact framework-specific focus target. The disabled
trigger case checks that Tab skips it without requiring every browser to tab to buttons: Safari's
default Tab preference can skip the trailing button too. Both implementations' actual focus remains
in the comparison. Real AT and saved-profile autofill remain separate verification work.

## Modal, geometry and direction coverage

`tests/positioning.scenarios.ts` adds thirteen comparisons: selection and Escape, modal background
blocking, non-modal background activation, canceled outside closing, page scroll lock/release,
Trigger toggling, selected-text alignment/realignment in LTR and RTL, viewport-resize dismissal,
explicit RTL start alignment and implicit anchored center alignment.

Both fixtures set native document direction and a framework direction provider before bootstrap.
The Angular Root container uses the same grid spacing and width constraints as the React fragment;
Angular's separate item-aligned parts retain their real content queries and DI hierarchy. Default
alignment coverage omits the Angular `align` binding entirely; other anchored cases explicitly use
`start`. Passing undefined to an Angular input would overwrite its default and would not test omission.
Geometry checks use a 2 CSS-pixel alignment tolerance and assert viewport containment. Raw rectangles/deltas
are retained separately from canonical state. Equal trigger/popup widths would mask default alignment,
so the default and RTL anchored cases deliberately render a narrower popup.

Native wheel input probes page scrolling before/after logical close; a locked scroller need not emit
a DOM `wheel` event. Background clicks use actual coordinates to test modal hit blocking, and native
button handlers count activations. Recording adapters do not mirror component state. The ordinary
typeahead close/reopen scenario waits for close completion; deferred fast reopening retains its
separate lifecycle checks.

The increment fixes duplicate outside requests caused by an invented `(0, 0)` trigger pointer origin,
and restores a cancelable `trigger-press` close when the open Trigger is pressed. The implicit anchored
alignment now matches the pin's `center`; explicit `align="start"` retains the previous Angular default.
Canceled pointer/mouse compatibility retries remain a documented difference rather than an extra
Angular event path.

## Dynamic collections and touch input

`dynamic.scenarios.ts` drives eleven application-data changes through identical F-key commands
in both fixtures. The commands only change options: they never assign selection, focus, open state
or lifecycle completion. New option objects are tracked as supplied values so reference checks
accept genuine additions/reloads and continue rejecting invented callback values. Native toolbar
buttons expose the same actions for manual inspection.

Removal now shares the cancelable Root commit path: scalar values fall back to the initial option
or null, multiple values prune missing options. Angular reconciles settled, previously populated
open collections with `afterRenderEffect`; initial async loads, close/unmount and empty lists are
excluded. Reordering retains Angular's element identity policy instead of duplicating upstream
index bookkeeping. Changes to a closed/unmounted collection remain follow-up work.

`touch.scenarios.ts` uses `hasTouch: true` while retaining the same desktop viewport and UA.
Playwright `tap` exercises trusted browser input in Chromium/WebKit. Chromium's public
`Input.dispatchTouchEvent` API adds native pan/cancel and list scrolling. No synthetic DOM event
or private WebKit protocol stands in for a gesture. Firefox touch and WebKit move/cancel are skipped
with reasons retained in both JSON and Markdown. Skips are capability limits, not passing tests.
Observations record input mode and trusted pointer/touch/click events independently of canonical
callback comparison. No real mobile device, saved profile or assistive technology is emulated.

The common backdrop click listener lets WebKit deliver its native compatibility mouse sequence;
the shared dismiss touch state machine still owns closing. Select touch highlight survives the
pointer leave at gesture end, while touch moves do not apply mouse-hover navigation.

## Viewport and container constraints

`geometry.scenarios.ts` adds twelve 640×480 layouts plus a scroll-arrow scenario. Shared
`geometry.ts` supplies application classes/options only. Viewport size is set before navigation,
so resize-dismissal cannot race the opening under test. Consumers constrain the flex/scroller
surfaces using Tailwind. The native scroll arrows have identical absolute edge classes in both
fixtures; Storybook additionally covers in-flow buttons changing list height.

Both sides must keep the popup within the viewport and the chosen/highlighted option inside a
nonempty list, navigate to both ends and commit the same value. Interior item text alignment uses
2 CSS pixels; RTL edge clamping checks block alignment and containment while retaining inline delta.
Native wheel input scrolls the parent and checks anchored tracking. Portals must escape a clipping
ancestor or mount in the requested custom host. Anchored portals include a transformed host;
item-aligned transformed containing blocks are covered separately by the sizing safety cases.

Hover tests use actual travel across the arrow and a controlled browser clock, then require scroll
stop after leaving. The pin ignores WebKit's zero-delta native MouseEvents: its exact failed hover
is an engine-scoped observation, not a skipped Angular test. At the bottom, the reference can leave
4px list padding after End; native wheel reaches the actual boundary before arrow-hide assertions.

Popup uses the common ResizeObserver effect to keep keyboard highlight visible after scroll-button
layout changes. It owns scrolling instead of an unconditional duplicate effect in each button.
First/last keyboard targets include list padding. The helper's capability guard keeps browser-free
rendering/tests valid; Angular destroys the observer with its view.

The original bounds checks do not assert identical dimensions. `sizing.scenarios.ts` adds ten cases:
eight compare coordinates, panel/positioner dimensions, native offsets and client heights within 2
CSS pixels; raw deltas live in `sizingComparison`. Shared assertions also cover native wheel growth
in both directions, explicit max-height, short lists, edge fallback, no selection and retained reopen.
The two transformed cases instead assert and record the exact safe-fallback/reference-overflow gap.
Neither fixture writes model, focus, open state or completion to make geometry agree.

Wheel deltas describe native input, not guaranteed CSS-pixel travel. In particular, Linux WebKitGTK
can apply a gesture incrementally while item-aligned expansion changes the scroll range. Growth
checks use repeated native wheel input until the available height and the requested scroll boundary
are reached; the capped case reaches the list's end. Measurements wait for six unchanged animation
frames rather than sampling an in-flight gesture. Every input pulse and intermediate measurement is
retained, and the 2px comparison tolerance is unchanged. Home/End then verifies keyboard navigation
across the full list before committing a value.

Both visual panels use equivalent consumer constraints; anchored heights are capped through their
rendered side, while item-aligned height is allowed to expand. Popup/Content remain separate Angular
parts. Popper supplies both modes' initial measurements and the entire fallback/arrow engine;
Select's initial/expansion arithmetic is pure and local. A single rendered-side writer prevents
competing host-directive attributes from applying anchored max-height to an item-aligned panel.
Popup owns shared scroll-edge state, including native/library scroll writes and ResizeObserver.
Readiness activates the existing focus manager after the layout settles; no direct focus is forced.

Nested modal portal configurations, actual pinch zoom/mobile visual viewport changes, AT and saved
profiles remain further work. Live anchor and CSS-scale coverage is described below. The
Angular Storybook suite independently checks pending-measurement close/reopen and in-flow buttons;
different framework completion timing is not a shared pre-placement phase boundary.

## Live layout and anchor tracking

Twelve cases in `live-layout.scenarios.ts` exercise native ancestor scrolling while open, trigger
width/translation/scale, row height, consumer max-height, labels, frozen tracking, reopening and clipping.
Both adapters use the same application commands/classes from `live.ts`. Model, focus, open state and
scroll offsets remain primitive-owned. Every mutation checks unchanged form entries and no value
callbacks; keyboard navigation then commits a real option. Rectangles retain value/selected text too.

Anchored tracking follows the trigger; explicit `disableAnchorTracking` freezes its anchor metrics.
Item mode defaults to frozen tracking; opting in refreshes metrics/width while retaining opening
coordinates, matching the pinned implementation. Reopening measures current CSS. A clipped trigger
sets `data-anchor-hidden` while Root remains open; automatic hiding is an independent Angular option.

`scaled-anchor-alignment` records exact true/false selected-text alignment in the initial scaled
trigger case and two scaled reopen checkpoints. The pin normalizes trigger scale in a different
coordinate space; Angular keeps native viewport rectangles. A scaled item-aligned portal records the
existing `transformed-alignment-fallback` mode/containment pair. Raw rectangles remain available;
these are bounded reference limits, not new value/focus exceptions or pixel-identical CSS claims.

Nine additional Storybook cases cover both modes, disabled tracking, scaled triggers/portals, and
clipping with/without automatic hiding. See [ADR 0031](../../../../docs/adr/0031-select-live-anchor-tracking.md).

## Evidence and CI

CI uses Node 24 from `.nvmrc` and all three engines on Ubuntu 24.04. It publishes a job summary and uploads
`dist/parity-testing/select/results`: `observations.json`, `summary.md`, the HTML report and traces for failed
scenarios. Fixture `dist/parity-testing/select/fixtures/reference.json` and every scenario observation record the full
reference commit, package version and digest. Browser/version and host platform are included so
results from different engines cannot be conflated. The report labels recorded differences even when the
regression check passes.

To inspect the pages manually after `pnpm parity:build select`:

```bash
PARITY_PRIMITIVE=select pnpm exec vite preview --config apps/parity-testing/vite.config.mts
# http://127.0.0.1:4500/angular.html?case=single
# http://127.0.0.1:4500/react.html?case=single
```

Six nested cases exercise Dialog/Popover parents, a modal child and custom portal containers.
They compare child/parent Escape ownership, native parent-control activation, return focus,
reopening/selection and wheel lock release. Parent controls remain part of the active floating
chain even when the child is modal. Known virtual-focus and closed-DOM differences remain exact.
