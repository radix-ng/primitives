# Select behavioral comparison

This runs the same Playwright actions against an Angular Select and an unmodified Base UI React
Select. It is a differential regression check with explicitly recorded differences, **not complete
behavioral parity certification**.

Use Node.js 24 (`nvm use`) and install workspace dependencies, then:

```bash
pnpm exec playwright install chromium
pnpm test-parity:select
```

Shared preparation, TypeScript tooling and commands are documented in the
[runner guide](../../README.md). The pinned reference is [reference.json](../../reference.json).

## What is compared

The 41 scenarios exercise keyboard/typeahead, pointer/multiple selection, disabled/read-only states,
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
field. Any new, changed **or disappeared** difference fails and requires review. Shared assertions
still apply to both implementations. The report preserves all raw observations even on failure.

- `dom-focus`: Angular focuses the popup and exposes virtual highlight; Base UI focuses an item.
  Changing this remains gated on real assistive-technology review (ADR 0023 / 0027).
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

The pinned `Select.Portal` has no `keepMounted` prop. That comparison is explicitly excluded; Angular
keep-mounted coverage stays in its existing unit and Storybook browser tests. Chromium desktop,
nonmodal anchored positioning and one set of options are the current scope. Modal/item-aligned
positioning, touch/RTL, animation timing, saved-profile autofill, additional browsers and actual screen
readers are not certified by this check.

## Typeahead coverage and boundaries

`tests/typeahead.scenarios.ts` adds eleven pinned-reference comparisons for multiword labels, search
origin after arrows, Space on disabled items, immediate recovery from misses, repeated initials and
double-letter labels, duplicate labels, the 750ms timeout, close/reopen, read-only and multiple modes,
and the active-item origin with no selection. Shared assertions check actual highlight, value, open
state and form entries. No typeahead exception category is needed; only the existing DOM focus and
closed-view retention differences remain on these checkpoints.

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

The Storybook Typeahead demo supports both closed selection and open highlighting. Keyboard tests
wait for actual focus inside a visible popup before sending open-list keys, without forcing focus or
changing state; snapshots still record the exact framework-specific focus target. Real AT,
additional browsers and saved-profile autofill remain separate verification work.

## Evidence and CI

CI uses Node 24 from `.nvmrc` and Chromium on Ubuntu 24.04. It publishes a job summary and uploads
`dist/parity-testing/select/results`: `observations.json`, `summary.md`, the HTML report and traces for failed
scenarios. Fixture `dist/parity-testing/select/fixtures/reference.json` and every scenario observation record the full
reference commit, package version and digest. The report labels recorded differences even when the
regression check passes.

To inspect the pages manually after `pnpm parity:build select`:

```bash
PARITY_PRIMITIVE=select pnpm exec vite preview --config apps/parity-testing/vite.config.mts
# http://127.0.0.1:4500/angular.html?case=single
# http://127.0.0.1:4500/react.html?case=single
```
