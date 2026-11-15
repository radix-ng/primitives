# Tabs behavioral comparison

Compares Angular Tabs with the unmodified Base UI sources pinned in
[reference.json](../../reference.json). Run `pnpm test-parity tabs`, or add `--project=chromium` for
local iteration. The suite is discovered by the existing runner and CI without shared-tooling changes.

## Initial-value scope

Eleven scenarios run in Chromium, Firefox and WebKit: **33 comparisons**, no capability skips and no
reviewed exceptions. This first increment covers initial selection and notifications, not complete
Tabs parity. See the [primitive matrix](../../../../packages/primitives/tabs/PARITY.md) for remaining
keyboard, focus, ARIA, transition and Indicator work.

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
focus and native event type/trust/trigger metadata. Those fields are not certified by this increment.
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
after a later `defaultValue` input update. The unit suite passes **34 tests**.

The runner writes the current browser/version/reference manifest, observations, raw measurements and
HTML report to `dist/parity-testing/tabs/results/`. This local run establishes the initial-value scope
on macOS; it does not establish real-device, assistive-technology or Linux-specific behavior.
