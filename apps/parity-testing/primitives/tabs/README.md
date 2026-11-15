# Tabs behavioral comparison

Compares Angular Tabs with the unmodified Base UI sources pinned in
[reference.json](../../reference.json). Run `pnpm test-parity tabs`, or add `--project=chromium` for
local iteration. The suite is discovered by the existing runner and CI without shared-tooling changes.

Thirty-six scenarios run in Chromium, Firefox and WebKit: **108 comparisons**, with no capability skips
or reviewed exceptions. This includes eleven initial-value cases, eight Panel lifecycle cases and
seventeen direction cases.
See the [primitive matrix](../../../../packages/primitives/tabs/PARITY.md) for the remaining work.

## Initial-value scope

| Scenario                 | Selected value                                            | Initial `onValueChange`                             |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `implicit-zero`          | `0`                                                       | `initial`, value `0`                                |
| `implicit-later-zero`    | `0`, after an earlier value-1 tab                         | `initial`, value `0`                                |
| `implicit-missing-zero`  | First string value, `'one'`                               | `initial`, value `'one'`                            |
| `implicit-disabled-zero` | First enabled value, `1`                                  | `initial`, value `1`; cancellation has no effect    |
| `implicit-all-disabled`  | None                                                      | `initial`, value `null`; cancellation has no effect |
| `default-number`         | `1`                                                       | None                                                |
| `default-string`         | `'two'`                                                   | None                                                |
| `default-disabled`       | Explicit disabled value, `0`                              | None                                                |
| `default-null-number`    | None, even though a value-0 tab exists                    | None                                                |
| `default-null-string`    | None                                                      | None                                                |
| `value-null`             | None; controlled `null` takes precedence over default `1` | None                                                |

Both fixtures use real Tabs Root/List/Tab/Panel parts. React omits `defaultValue` in implicit cases;
Angular binds the equivalent `undefined` input. Neither fixture supplies local selection state,
changes selection in response to callbacks, or calls primitive methods. The two cancellation cases
call only the public event-details `cancel()` method, verifying that automatic consistency updates
still take effect. Notification value, reason, activation direction and cancellation flag are compared
without rewriting events.

Panels use `keepMounted=true` on both sides to isolate initial-value behavior from the documented
Angular persistent-host adaptation. The driver compares tab `aria-selected`/active/disabled state,
native Panel `hidden` state, actual browser visibility, selected/visible values and the complete
notification array after consecutive stable animation frames. Each side must also satisfy explicit
expected selection, visible-panel and callback assertions; matching wrong results cannot pass.

Raw DOM, including generated IDs, inertness, tabindex and mounting, is retained separately with actual
focus and native event type/trust/trigger metadata. Those fields are not certified by the initial-value cases.
For example, automatic synthetic event names differ between frameworks; no equivalence or exception
for native keyboard events is claimed. Page/console errors fail the scenario.

## G1 regression evidence

Before the fix, Chromium passed nine scenarios and failed `default-null-number` and
`default-null-string`: Angular selected `0` or fell back to `'one'` with reason `missing`, respectively,
while the reference kept no selection and emitted nothing. The initial failure report/traces were
preserved locally in `dist/parity-testing/tabs/before-null-fix/`.

Root now defaults only an `undefined` input to `0`, preserving explicit `null`. All 33 comparisons
pass with an empty `expected-differences.json`. Two Angular unit regressions also verify numeric/string
collections, no active or visible panels, no notification and preservation of the initial null choice
after a later `defaultValue` input update. The unit suite now passes **39 tests**, including inactive
Panel inertness, external direction/null changes on both axes, equal-coordinate activation and
direction publication before synchronous model subscribers run.

## Panel exits and focus

| Scenario                   | Scope                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `panel-retained-immediate` | Persistent Angular panel without structural presence; immediate hiding             |
| `panel-retained-exit`      | Retained hosts, held CSS exit, focus/pointer exclusion and Tab order               |
| `panel-presence-exit`      | Structural content removal after the panel-host animation completes                |
| `panel-presence-keep-exit` | Structural contents retained with `keepMounted=true`                               |
| `panel-natural-exit`       | Actual CSS exit completion without forced finishing                                |
| `panel-reselect-exit`      | Reselection during structural exit; old completion cannot remove reopened contents |
| `panel-retained-reselect`  | Reselection during retained exit, restored focus and click handling                |
| `panel-nested-exit`        | Finishing the nested animation first does not finish the still-running host exit   |

Both sides use the same consumer CSS. The held cases pause real 30-second CSS animations and finish
them through WAAPI; the natural case observes real completion. Native Enter changes selection.
During held exits, native Tab/Shift+Tab must traverse the active panel, its input/button and adjacent
control while excluding outgoing contents. Explicit focus attempts on an outgoing input must fail,
and trusted pointer coordinates over its action button must not activate it. Reselection restores
interactivity and preserves the reopened view. No adapter repairs focus, selection or animations.

Angular's existing two-directive adaptation is explicit: without structural presence, React uses
`keepMounted=true` to match Angular's persistent contents. With structural presence, React receives
the same `keepMounted` choice and Angular removes the contents of its persistent Panel host. The
driver compares actual content presence/visibility, Panel `hidden`, `inert`, tabindex and transition
attributes whenever content exists, actual focus, activation counts and all change requests. The
retained empty Angular host versus an absent React host is preserved in raw DOM, rather than treated
as evidence for equivalent host removal or mounted ARIA identities.

Before the fix, Chromium failed seven of eight new cases, including native focus entering an outgoing
input and structural contents disappearing before the host exit finished. The reports/traces are
retained locally in `dist/parity-testing/tabs/before-panel-fix/`. Panel now becomes inert as soon as it
is inactive; `data-hidden` follows actual hidden state after exit. `TabsPanelPresence` uses the existing
shared `PresenceMachine` with the Panel host as its motion root, so both host and descendant motion
can delay content removal. It owns only the embedded view; no second animation state machine was added.

The public keyframe story has a separate Chromium browser regression, covering an exit on nested
contents without a host animation, subsequent empty-host hiding and reuse. This is an existing Angular
animation capability, not proof that the pin waits for descendant-only motion: the pin waits on the
Panel element itself. Later-finishing/replaced descendant animations, root removal mid-exit and
live presence/keepMounted changes remain separate lifecycle follow-ups.

## External selection and activation direction

Seventeen `direction-*` cases compare both axes in LTR/RTL, null clearing/restoration, canceled
requests followed by an external update, same-update insertion/selection with numeric and out-of-order
string values, equal coordinates, focus inside/outside the list, disabled automatic fallback, and
missing destinations/origins. The four axis/direction cases also compare an accepted native request
followed by an external update. The equal-coordinate case includes a native Enter request.

Fixtures own actual application signals/React state. Native F2/F3 change selection, F4/F5 clear/restore,
F6 appends a tab and selects it in the same update, F8 disables the selected tab, and F9/F10 select
missing values. Enter/click requests run through the real Tab; one case cancels through public event
details. No fixture writes a primitive signal, handler, direction attribute or measurement.

Every checkpoint compares actual selection, visible panels, all Root/List/Tab/Panel direction
attributes, Indicator direction when its value is non-null, focus, roving tabindex and notifications.
It also asserts direction on the first sampled animation frame with that application value/selection.
Raw DOM, sampled frames and actual tab rects remain in measurements. Indicator presence at null is
retained in raw DOM and remains G6; neither host lifetime nor Indicator geometry is certified here.

Root derives direction from the native model through `linkedSignal`; `afterRenderEffect` reads layout
after rendering. An insertion keeps its committed origin until the new tab registers and geometry
can resolve the value fallback. Real positions determine direction, including RTL; equal positions
return `none`. Automatic fallback explicitly resets direction without a directional transition.
External changes do not emit new user change requests, and canceled requests do not replace the origin.
Request/fallback direction is published before the model commit, so synchronous model subscribers see
the same direction as rendered parts.

The pin keeps the last registered origin while a controlled destination remains missing. For the
`Overview` → `Missing` → `Unknown` → `Overview` case, the observed directions are `left`, `right`,
`right`: returning to the retained origin preserves the last computed direction. The separate
initially-missing case establishes `none` when neither endpoint is registered. These actual pin
semantics are compared without an exception.

Before the runtime fix, the initial direction matrix failed **15/17** Chromium cases; all reference
assertions passed. That report is retained in
`dist/parity-testing/tabs/before-direction-fix-reference-checked/`. Three new unit cases also failed
before the fix; their geometry is explicitly mocked because jsdom has no layout. Later native
equal-coordinate/accepted-request checks extend the browser cases without changing that saved result.
The final suite compares 51 direction cases across three engines.

An Angular parent that ignores an accepted model request is not a React controlled-prop mirror;
cancel before commit to reject it. The current fixtures accept or explicitly cancel user requests.
Equivalence for an ignoring parent is not established. Dynamic orientation/style changes in the same
selection update and transition-frame CSS transforms remain separate combinations.

The runner writes the current browser/version/reference manifest, observations, raw measurements and
HTML report to `dist/parity-testing/tabs/results/`. This local run establishes the documented scope
on macOS; it does not establish real-device, assistive-technology or Linux-specific behavior.
