# Tabs behavioral comparison

Compares Angular Tabs with the unmodified Base UI sources pinned in
[reference.json](../../reference.json). Run `pnpm test-parity tabs`, or add `--project=chromium` for
local iteration. The suite is discovered by the existing runner and CI without shared-tooling changes.

Nineteen scenarios run in Chromium, Firefox and WebKit: **57 comparisons**, with no capability skips
or reviewed exceptions. This includes eleven initial-value cases and eight Panel lifecycle cases.
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
after a later `defaultValue` input update. The unit suite now passes **35 tests**, including inactive
Panel inertness.

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

The runner writes the current browser/version/reference manifest, observations, raw measurements and
HTML report to `dist/parity-testing/tabs/results/`. This local run establishes the documented scope
on macOS; it does not establish real-device, assistive-technology or Linux-specific behavior.
