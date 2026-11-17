# Tabs behavioral comparison

Compares Angular Tabs with the unmodified Base UI sources pinned in
[reference.json](../../reference.json). Run `pnpm test-parity tabs`, or add `--project=chromium` for
local iteration. The suite is discovered by the existing runner and CI without shared-tooling changes.

The previous complete suite passed **226 scenarios / 678 comparisons** across Chromium, Firefox and WebKit, with no
capability skips: eleven initial-value, twelve Panel lifecycle, seventeen direction, fifteen
native-identity, forty activation, seventeen Indicator visibility cases, twenty-eight geometry cases thirty-six collection cases thirty arbitrary-value cases and twenty controlled-owner cases. Four exact reviewed fields remain:
two authored-Panel-ID fields and two null-Indicator host fields. Whole-Panel presence removes the
former four persistent-Panel-host exceptions. See below.
See the [primitive matrix](../../../../packages/primitives/tabs/PARITY.md) for the remaining work.

The keyboard matrix now has **64 scenarios / 192 planned comparisons**, bringing the suite to
**290 scenarios / 870 comparisons**, all passing on Linux/arm64 in Playwright 1.60.0 Noble
with two workers and the original timeouts (`dist/tabs-render-linux/results/`). Its original failures are documented below. The native Tab
render boundary and outgoing-Panel frame now implement [ADR 0083](../../../../docs/adr/0083-tabs-native-tab-render-boundary.md).

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
passed with an empty `expected-differences.json` at that increment. Two Angular unit regressions also
verify numeric/string collections, no active or visible panels, no notification and preservation of
the initial null choice after a later `defaultValue` input update. The unit suite now passes **54
tests**, including eight native-activation regressions, seven native-identity regressions, inactive Panel inertness, external direction/null
changes on both axes, equal-coordinate activation and uncontrolled direction publication before synchronous accepted-value subscribers run.

## Keyboard navigation and consecutive native input

Sixty-four `keyboard-*` cases exercise horizontal/vertical layout, LTR/RTL through real direction
providers, manual/automatic activation and both loop policies. Additional cases cover disabled
middle/edge/default tabs, an all-disabled null selection, controlled acceptance/ignore/delay,
Shift/Ctrl/Alt/Meta/combined modifiers and forward/reverse Tab through the active Panel, its input,
action and adjacent controls. Disabled tabs stay arrow-focusable without requesting selection.
Returning focus to an ignored controlled destination can request it again.

The rapid cases send Enter, Space or an automatic-selection arrow followed immediately by native
Tab or Shift+Tab, without a DOM assertion, animation frame, delay or focus repair between those
commands. Retained/structural Panels, controlled ownership, disabled destinations, reverse exit and
vertical RTL have separate cases. Three alternating selections exercise repeated entry and exit.
Rapid pairs use the shared Playwright clock, installed before navigation and paused before the
interaction. Real activation and Tab are delivered within the same fixed JavaScript paint-frame
boundary on both sides. The clock advances only after both native keys, then resumes before the
settled checkpoint. No primitive state or focus is supplied by the driver. This makes the outgoing
Panel's layout phase comparable rather than letting protocol latency finish one side's exit first.
Raw key timestamps use that controlled clock, and the actual selected DOM tab at each capture is retained.

Checkpoints independently assert selection, visible Panels, all part directions, the complete
request trace and expected native focus. Differential state includes every Tab/Panel tab stop,
inert/hidden state, the complete native focusin sequence, key targets/trust/modifiers/default
prevention/propagation and actual page scroll. Raw DOM, native IDs/IDREFs, bounds and callback events
remain measurements. The key probe reads the original event's final `defaultPrevented` flag when
serialized: a capture-listener microtask can run before later native listeners and is too early.
macOS WebKit uses its native Option+Tab convention on both sides, as existing Tabs focus cases do.

The historical pre-fix native-input baseline recorded **146/150** comparisons: **50/50 Firefox**, **50/50 WebKit**
and **46/50 Chromium**. All 37 ordinary-navigation cases pass in all engines. Chromium loses focus
to BODY in four rapid cases: retained uncontrolled Enter, retained/structural controlled Enter and
controlled automatic-arrow selection. The exact failed round varies with render scheduling. No
reference assertions fail. Observations are retained in
`dist/parity-testing/tabs/keyboard-native-baseline/`.

The same pre-fix built fixtures recorded **143/150** on Linux/arm64 in Playwright 1.60.0 Noble, with one
worker and original timeouts: **50/50 Firefox**, **50/50 WebKit**, **43/50 Chromium**. All seven
failures concern rapid input; none are reference assertion failures or capability skips. Space,
vertical RTL Enter and uncontrolled automatic-arrow selection also expose stale DOM. In the latter,
Tab can enter the old tabindex-0 Tab before it updates, triggering an extra automatic request that
reverts the selected value. This is a selection/callback failure as well as a focus difference.
The report is retained in `dist/tabs-keyboard-linux/results/`.

The original capture records show an old selected DOM tab when Tab arrives, followed by native
focus entering the old Panel before Angular hides/removes it. ADR 0083 resolves that interaction
through a Tabs-owned pending-render coordinator: click/focusin marks its List; an unprevented native
Tab flushes current Angular work before the browser default. It never accepts a requested value on
behalf of a controlled parent. Normal render, destruction and a shared reentrancy guard bound the
work. Consumers need no providers or application options.

The first synchronous run corrected focus/selection but exposed the pin's minimum outgoing-Panel
frame. Angular now retains the inert, tabindex=-1 Panel through that frame, with CSS exits still
observed. Structural Presence uses an owner hold to defer removal without postponing CSS discovery.
The small vertical viewport still compares actual page scroll; no tolerance or scroll normalization
is added. Eight new Angular facade cases place Root on a component host, with List/Panel sibling
children and the value binding in the parent. React uses its real ordinary parts.

An initial full run with unconstrained frame timing passed **867/870**, with three rapid scroll
mismatches; all **678 older controls** passed. Linux passed **79/81**, with two scroll mismatches.
Those reports are preserved in `keyboard-native-frame-timing/` and
`dist/tabs-render-linux/before-clock-boundary/`. All **81 rapid rows** then pass across the three
macOS engines and **81/81** on Linux/arm64 with the matched frame boundary. The final complete
Linux/arm64 run then passes **870/870**, with two workers and the original timeouts in Playwright
1.60.0 Noble (`dist/tabs-render-linux/results/`). Eleven boundary units, a structural-reopen unit
and five Presence hold units pass;
the affected consumer suites pass **704 tests**, and seven selected SSR checks pass.

A later macOS keyboard run exposed unrelated raw page-scroll variation on unhandled arrows in
WebKit: 0 versus 40 px, occasionally a -1 px overscroll. Longer settling, held keys and serial
execution did not eliminate it. An independent native-button-only HTML control also records 0/40 px
without either framework (`dist/parity-testing/tabs/native-scroll-control/`). The 186/192 run is
preserved in `keyboard-browser-scroll-settling/`. These observations are not normalized or accepted
as expected differences; the 81/81 rapid rerun is the stated macOS scope.

The [CI run 43896511979](https://github.com/radix-ng/primitives/actions/runs/43896511979), before
this fix, failed eight Chromium rapid handoffs and one WebKit rapid vertical-scroll comparison.
All nine belong to the rapid matrix above. Its separate Menubar completion failures are outside this
Tabs change.

An earlier observer experiment is retained in `before-keyboard-fix/`: it read `defaultPrevented`
from a capture microtask and failed assertions on both frameworks, so it is not runtime regression
evidence. The next Chromium experiment (`before-keyboard-runtime-fix/`) reproduced one native Angular
focus failure and also exposed a wrong expected request count on controlled re-entry. Correcting that
expectation gives the final 150-row baseline above, with zero reference assertion failures.

## Controlled selection ownership

Twenty `controlled-*` cases add 60 comparisons for ignored/repeated requests, immediate acceptance,
delayed acceptance, replacement/null responses, cancellation and automatic focus activation. They
include both axes/RTL, equal-field object identities, function values, null/missing/disabled inputs
and whole-Panel presence. Each framework uses its own real parent state; fixtures never write Root
state. F2 applies a pending parent response; F3/F4/F6 make external parent updates without moving focus.
RTL uses actual DirectionProvider APIs for keyboard behavior plus native direction for layout.

Checkpoints assert the expected parent value, actual native selection/Panel visibility, complete
request trace, every part's direction and Indicator visibility, then compare focus/tab stops and
literal visible Indicator variables. Raw DOM, IDs/IDREFs, bounds, native events and optional Angular
triggers remain recorded. Original object/function identities are checked against stable local
catalogs; functions must never execute. Angular's real `valueChange` output is independently asserted
and kept raw; the reference does not emulate that Angular output.

A defined input now owns selection through a computed readonly `root.value()`. One private signal
owns uncontrolled state. Ignoring or postponing a request leaves selection/direction unchanged;
repeated requests remain observable until the input actually changes. A replacement follows the
parent's destination. `[(value)]` uses ordinary input/output binding and cancels before emitting the
accepted-value output. Actual selection can be observed through the readonly signal; `valueChange`
reports accepted requests, including a request the parent ignores.

The initial experiment's 20 new Chromium rows had 17 Angular behavior failures, two passes and one
invalid RTL fixture that failed focus setup on both frameworks. The missing direction providers were
corrected; that raw report remains in `dist/parity-testing/tabs/before-controlled-fix/` and is not a
zero-reference-failure baseline. All final controlled cases and the complete **678-row Tabs suite**
pass across three engines, with unchanged four reviewed fields. All **69 focused Linux/arm64 comparisons** also pass (60 new rows and nine controlled-collection
controls), in Playwright 1.60.0 Noble with one worker and original timeouts, retained in
`dist/tabs-controlled-linux/results/`. Tabs units pass **83 tests**; five
fresh Storybook checks include actual two-way acceptance/cancellation, and five selected SSR checks
and library/SSR-app/consumer-skill builds pass. See [ADR 0081](../../../../docs/adr/0081-tabs-controlled-selection-ownership.md).

Explicit default initialization and external input updates do not emit requests. Automatic
uncontrolled changes commit selection/direction before notification and cannot be canceled. Moving
between controlled/uncontrolled modes through undefined and client hydration remain outside that
ownership increment's certification. The later keyboard increment above covers its stated rapid-input scope.

## Arbitrary value identities

Thirty `values-*` cases exercise objects/arrays with equal fields, functions, symbols with equal
descriptions, bigint, boolean, mixed/falsy values, null, explicit undefined and signed zero. Catalogs
are created once per application instance. Root receives the actual value instances, and Tab/Panel
pairs share them. Native clicks/Enter activate values; F2/F3/F4 remove/refill/disable application
options; F5/F6 change controlled application inputs. No callback feeds an uncontrolled Root.

Assertions check the original callback reference against catalog entries with Object.is, plus its
type/null/undefined markers. This preserves distinctions that JSON value serialization would lose;
callbacks remain stored unchanged in the browser probe. Native selection/Panel state, complete
callback traces, focus/tab stops, direction, resolved IDREF ownership and every non-null Indicator
variable compare directly. Original generated IDs, literal IDREFs, bounds, DOM and event metadata
remain raw measurements. Opaque objects throw on coercion, and function/coercion counters must stay
zero. The driver never replaces primitive state or callback values.

All **330 affected comparisons** pass across Chromium, Firefox and WebKit: 90 new value rows and
240 collection/direction/identity/Panel controls. All **90 new rows** also pass in Playwright 1.60.0
Noble Linux/arm64 with one worker and original timeouts, retained in `dist/tabs-values-linux/results/`.
Twelve new units pass (two fail against the old
runtime); Tabs has 75 passing tests. Four fresh Storybook checks, five selected SSR checks and
library/SSR-app/consumer-skill builds pass. See [ADR 0080](../../../../docs/adr/0080-tabs-arbitrary-value-identities.md)
for the breaking unknown type migration and the two runtime fixes.

The initial local 30-case experiment had three Angular runtime failures (two undefined Panel cases
and canceled NaN direction), plus one invalid reference fixture containing both 0 and -0. That
fixture caused the unmodified pin to hit React error 185 and was corrected to use one zero-valued Tab
with an initial negative-zero selection. The original raw report is preserved in
`dist/parity-testing/tabs/before-values-runtime-fix/`; it is not a zero-reference-failure baseline.
The corrected fixture and explicit assertions pass after the fix, with no new exception or skip.

Root's initial undefined still selects uncontrolled/default behavior. A later uncontrolled native
undefined request is covered; switching a controlled Root to undefined is not. An authored null
Tab/Panel matches selected null, while Indicator remains hidden. Its host-presence adaptation is
unchanged: these cases compare Indicator visibility and literal variables when visible, retaining
both actual host policies in raw DOM. Zero and negative zero are one === identity; duplicate values
are unsupported. NaN is tested only through canceled requests, not as a selected identity. Actual
client hydration and cross-process preservation of arbitrary identity values are not certified.

## Dynamic collections and focus

Thirty-six `collection-*` cases cover selected/final/unselected removal, empty/refilled/delayed Lists,
empty/populated native List replacement, whole-List absence/remount, new values, replaced selected
nodes, all-disabled/re-enabled collections, disabled-default honor transitions and controlled values.
They include focused removal, removal before focus, repeated reorder, vertical RTL, automatic focus
activation, canceled activation before reorder, whole-Panel presence and removal after native Enter.

F2/F3/F4 mutate only consumer collection/input state. Uncontrolled callbacks are never fed back into
Root. Fixed Panels expose its selected value even while no matching Tab or List exists. Expected
values/reasons/counts are asserted independently on each implementation. Checkpoints compare actual
native focus, ordered `aria-selected`/disabled/`tabindex`, visible/hidden/inert Panels, Root/part direction
and the complete callback trace. Native list re-entry starts a separate navigation phase after the
mutation focus has been recorded; the driver does not repair mutation results. Native Enter recovers
from null selection, then arrows verify continued keyboard navigation.

Before the fix, the original 34 Chromium cases had **10 failures / 24 passes**, with no reference
assertion failures, preserved in `dist/parity-testing/tabs/before-collection-fix/`. Partial maps caused
premature fallbacks; positional highlighting lost the native tab stop; Angular view movement cleared
focus. Registration/map publication/reconciliation now follow render phases, Composite retains the
highlighted element and restores only observed native moves, and Tab restoration does not repeat an
automatic activation request. Existing four reviewed fields are unchanged. See
[ADR 0079](../../../../docs/adr/0079-tabs-collection-consistency.md).

All **108 collection comparisons** pass across Chromium, Firefox and WebKit, with strict fixture
build and 13 shared runner checks. At the G2 increment the suite contained 176 scenarios / 528 planned comparisons;
earlier full-run counts retain their original scope. All 108 rows also pass in Playwright 1.60.0 Noble Linux/arm64 with one worker and original timeouts,
retained in `dist/tabs-collection-linux/results/`. Shared consumer units pass **731 tests** with
five existing skips, including 63 Tabs and 31 Composite tests. Ten focused Chromium checks against a
fresh Storybook build pass for Tabs, Composite and affected navigation/menu consumers.

Raw DOM, generated IDs, IDREFs and native events remain recorded. These collection cases do not
certify resolved identity equivalence while a whole List is absent; they certify selection, Panel
state, focus, tab stops, direction and callback policy. Whole-Root disposal and actual hydration remain
separate lifecycle work.

## Panel exits and focus

| Scenario                   | Scope                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `panel-retained-immediate` | Persistent Angular panel without structural presence; immediate hiding             |
| `panel-retained-exit`      | Retained hosts, held CSS exit, focus/pointer exclusion and Tab order               |
| `panel-presence-exit`      | Structural content removal after the panel-host animation completes                |
| `panel-presence-keep-exit` | Whole Panel view retained with `keepMounted=true`                                  |
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

Ordinary Angular Panels retain their hosts; React uses `keepMounted=true` for those controls.
For structural cases, `*rdxTabsPanelPresence="value"` is on the Panel host and owns its complete
embedded view. Both sides receive the same mounting policy. The driver compares actual host and
content presence, native hidden/inert/tabindex/transition attributes, input values, focus,
activations and callbacks. No empty-host distinction is normalized away.

Four additional cases cover fresh child/input state and a new native host after completed exit,
retained state and the same host with `keepMounted`, Root removal during held exit, and dropping
`keepMounted` on an already-closed view without starting another exit. The identity presence case
also returns to the first Panel and verifies its stable owner ID and real IDREFs. Six units verify
Angular child destruction/retention, exactly-once disposal, owner identity and nested-Root scope.
The completed-exit cases also observe real `data-starting-style` mutations on inserted and retained
hosts. Moving the transition ref to the structural owner preserves enter history across native view
destruction; initially-open markup stays settled. Before that correction the remount case failed
with all reference assertions passing (`dist/parity-testing/tabs/panel-owner-before-enter-fix/`).
See [ADR 0077](../../../../docs/adr/0077-tabs-whole-panel-presence.md) for the API migration.

The final whole-Panel suite passes all 336 comparisons; the 48 affected Panel/identity comparisons
also pass in the Playwright 1.60.0 Noble Linux/arm64 image with one worker and the original timeout.
Those Linux observations are retained in `dist/tabs-panel-owner-linux/results/`. Public keyframe and
projected-wrapper Storybook regressions both pass against a fresh build.

Before the fix, Chromium failed seven of eight new cases, including native focus entering an outgoing
input and structural contents disappearing before the host exit finished. The reports/traces are
retained locally in `dist/parity-testing/tabs/before-panel-fix/`. Panel now becomes inert as soon as it
is inactive; `data-hidden` follows actual hidden state after exit. `TabsPanelPresence` uses the existing
shared `useRenderLifecycle` with the Panel host and explicit `rdxPresenceTarget` descendants as participants, so registered motion
can delay content removal. It owns only the embedded view; no second animation state machine was added.

The public keyframe story has a separate Chromium browser regression, covering descendant-only
exit motion followed by destruction of the entire Panel and recreation on return. This is an existing Angular
animation capability, not proof that the pin waits for descendant-only motion: the pin waits on the
Panel element itself. Later-finishing/replaced descendant animations, actual hydration and further live-policy
combinations remain separate follow-ups. Root removal mid-exit and dropping a closed keepMounted
view are covered by the whole-Panel cases above.

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

Root derives direction from its effective selected value through `linkedSignal`; `afterRenderEffect` reads layout
after rendering. An insertion keeps its committed origin until the new tab registers and geometry
can resolve the value fallback. Real positions determine direction, including RTL; equal positions
return `none`. Automatic fallback explicitly resets direction without a directional transition.
External changes do not emit new user change requests, and canceled requests do not replace the origin.
Uncontrolled selection/direction is published before accepted-value outputs. Controlled request
details describe the requested direction; rendered parts follow the actual input selection.

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
The final suite runs 51 direction comparisons across three engines.

The controlled ownership cases above now compare ignoring parents, delayed responses and
replacements. Dynamic orientation/style changes in the same selection update and transition-frame
CSS transforms remain separate combinations.

## Native identities and reciprocal relationships

Fifteen `identity-*` scenarios cover retained and absent parts, authored and reactive Tab/Panel IDs,
same-value replacement, shadowed registrations and their cleanup, insertion before an existing owner,
Tab/Panel value edits, independent Roots, numeric `1` alongside string `'1'`, structural presence and
Indicator lookup with a custom Tab ID. Native F2/F3 commands edit application collections/IDs; real
Enter selects a tab in the multi-root, mixed-value and presence cases.

Each checkpoint resolves actual native IDREFs through the document and compares their target parts.
Missing, dangling and cross-root references are distinct results. Generated IDs must be present and
unique, preserve instance identity across value edits, and avoid reusing a removed part's ID. Authored
IDs are compared literally. The driver retains raw DOM/IDREFs, focus and errors; it does not rewrite
IDs or repair relationships. Selection and notifications are also compared. The Indicator case checks
that its width follows the actual active Tab before and after an authored ID change; separate G6
increments below establish visibility, resize observation and coordinate geometry.

Before the runtime change, Chromium failed **13/15** cases with all reference assertions passing;
evidence is retained in `dist/parity-testing/tabs/before-identity-fix/`. Seven new Angular unit tests
failed before the fix. Per-instance `injectId`, owned Panel registration and a native Tab registry now
maintain relationships. Labels use Composite DOM order in the client and native registration during
SSR. Four selected SSR checks include authored/generated IDs, reciprocal links, unique identities and
active/absent/kept whole-Panel views; actual client hydration remains outside this increment.

[ADR 0074](../../../../docs/adr/0074-tabs-native-identities.md) retains the authored-ID difference:
the pinned Panel registers a generated ID even when a forwarded authored `id` replaces its DOM ID.
The custom-ID case exposes dangling controls in the reference; Angular registers its actual native
ID. Two exact control-map fields remain reviewed exceptions. React omits the `id` prop when unspecified,
since forwarding `id={undefined}` would itself erase the pin's default DOM ID.

Whole-Panel presence from [ADR 0077](../../../../docs/adr/0077-tabs-whole-panel-presence.md) supersedes
the former persistent-host adaptation. The initial comparison had no assertion failures or unexpected
differences and reported all four old `persistent-panel-host` fields stale; its report is retained
in `dist/parity-testing/tabs/panel-owner-stale-exceptions/`. Those four exceptions are removed.
Actual Panel presence, labels and ID lifetime now compare without a structural-host exception.

Both fixtures assert their actual native relationships. The two remaining G5 exception fields are
limited to the pin's authored-Panel-ID mismatch; selection, labels and callbacks stay compared.
Latest Panel registration wins, and removing its owner does
not resurrect a shadowed registration; a later native hidden-state change can re-register a retained host.
Arbitrary object/function values, imperative DOM-ID mutation and live cross-root moves remain outside
this scope.

## Native keyboard and host activation

Forty `activation-*` cases cover native buttons, div hosts, links and anchors without href; Enter,
Space, held/repeated keys, cancellation followed by a second physical press, modifier preservation,
consumer-prevented Enter, disabled click/key defaults, descendant keys, form non-submission and held
right/middle presses with automatic focus activation after release.

Focus enters the list by native Tab and moves to the tested part with ArrowRight. Native keyboard
and pointer input drives activation. A secondary-press case focuses the actual element while its
native press is held, accommodating whether the OS itself focuses that press, then verifies native
arrow-focus activation after release. These two fixtures prevent the OS context-menu default so it
cannot consume the release; a native pointerup must be observed before the next focus request.
Fixtures use real parts and cancel only through public event
details. Document capture/bubble listeners observe native defaults, trust, targets, modifiers and
their order relative to callbacks. They never synthesize a primitive response or repair its state.

Checkpoints compare actual selection, focus, tabindex, host attributes, callback count/type/trust/
target/modifiers/reason/direction/cancellation, event order, link hash, scrolling and form submission.
Selected-tab repeats cannot request a new value. A canceled request must await another physical
request; Space keyup cannot dispatch a duplicate. Native link Enter repeat remains browser-owned,
with actual counts compared between implementations and every callback required to carry a click.

Before the runtime change, all **40/40** Chromium cases failed with zero reference assertion failures;
the baseline is retained in `dist/parity-testing/tabs/before-activation-fix/`. Eight new unit checks
failed before the fix. The unit-only Enter test now explicitly verifies delegation to a later click;
browser input proves native Enter. The existing focus unit uses actual focus rather than dispatching
an isolated non-bubbling focus event. Press-listener units verify paired removal after up/cancel/destroy.

[ADR 0075](../../../../docs/adr/0075-tabs-native-activation.md) records the native Angular adaptation.
Angular keeps its optional native `eventDetails.trigger`, while pinned Tabs leaves it unset. Each
policy is asserted independently and the raw trigger/native event data is retained in measurements;
equal trigger availability is outside the callback equivalence above. No new differential exception
is introduced. Touch/pen, native cancellation/removal during a press, auxiliary link activation,
authored submit/reset types and real device/AT behavior remain follow-ups.

The forty activation cases also passed all **120 comparisons** in the Playwright 1.60.0 Noble
Linux/arm64 image against the same built fixtures. This browser-only pass ran with one worker and
the original timeout, after an overloaded parallel attempt hit timeouts. Its observations are retained
in `dist/tabs-g8-linux/results/`; it supplements the full macOS suite rather than replacing its build.

## Indicator visibility and observation

Seventeen `indicator-*` cases add 51 comparisons for both axes, null/missing/hidden/zero-size tabs,
active and preceding-tab resizing, dynamic labels, List resize, tab insertion/replacement, List
replacement followed by resize, multiple indicators and Indicator removal/recreation followed by
resize. Native F2/F3/F4 application commands change consumer values, classes, labels and keyed parts.
They never write primitive state or manually notify a ResizeObserver.

Every checkpoint compares selection, notifications, actual host presence/hidden state/role,
visibility and all six CSS variables. Native rectangles and scroll dimensions remain in raw
measurements. Visible indicators must physically match their selected tab. Numeric variables are
not rounded for comparison: the text-sized case exposed a 0.00025px computed-CSS/rect difference,
fixed in the runtime by preserving computed CSS dimensions.
Rendered box assertions allow less than 0.05 CSS px for native layout quantization after serialization;
the variable comparison remains exact. Linux Chromium exposed an identical 0.0155px box-versus-CSS
rounding on both implementations; its initial report is retained in
`dist/tabs-g6-linux/before-box-assertion-fix/`.

All 17 new Chromium cases failed before the change, with no reference assertion failures; the
baseline is retained in `dist/parity-testing/tabs/before-indicator-fix/`. Adding role/hidden state
still left nine runtime failures from stale observations, plus the intentional null-host difference;
that intermediate report is in `dist/parity-testing/tabs/before-indicator-observation-fix/`.
Render effects now measure the registered selection and observe the current List and every tab.
Three units check observed elements and cleanup, including a surviving Indicator across List
replacement; two failed before the fix. These units do not claim jsdom layout evidence.

[ADR 0076](../../../../docs/adr/0076-tabs-indicator-observation.md) accepts two exact `hosts` fields:
at initial and restored null, Angular retains a hidden presentation host while React omits it.
Both fixtures assert that actual policy; visibility and geometry still compare independently.
G6 adds two null-host fields; after whole-Panel presence, two G5 authored-ID fields remain.

`pnpm test-parity tabs --grep 'indicator-|direction-'` passes **105 comparisons** across Chromium,
Firefox and WebKit: all 51 new rows plus 54 affected direction/identity controls. The suite now
at that increment contained 108 scenarios / 324 planned comparisons. The later whole-Panel run
passes all **336 comparisons** (112 scenarios) with no skips, and all **63 unit tests**. Historical
G6 run counts above retain their scope.
Borders, overflow/scroll, transforms and intermediate scrollers were outside that visibility
increment; the coordinate comparisons below extend its scope. Native realms and actual hydration/
first paint remain separate work.

The G6 Linux/arm64 pass in Playwright 1.60.0 Noble passes **54 comparisons** (51 new rows and three
custom-ID controls), using one worker and the original timeout. Results are retained in
`dist/tabs-g6-linux/results/`. A supplemental three-engine macOS label run also passes after the
physical-box assertion correction; the original 105-row macOS verdict is unchanged.

## Indicator coordinates, transforms and scroll

Twenty-eight `geometry-*` cases add 84 comparisons for borders/padding, List/Tab content-box sizes,
fractional layout, horizontal/vertical scroll in LTR/RTL, ancestor scale/rotation/flip/skew/
perspective/zero scales, Tab matrix/percentage/combined translations and rotation/scale, offset
parent chains, and intermediate scrollers with/without rotation. Native wheel input moves actual
scroll containers; F2/F3 change only application selection. Intermediate-scroll cases compare a
measurement after that selection change, not continuous tracking without a render.

Native slots provide an independent authored layout: fixed CSS sizes/gaps establish expected local
coordinates. Actual Tab rects check physical alignment, while Tab-local rotation/scale compares the
passive native slot because the pin's indicator keeps its untransformed layout box. All six variables
compare literally, with finite-value assertions; raw rects and client/scroll metrics accompany them.
No driver rounds geometry or repairs primitive state. Rendered bounds retain the existing <0.05px
layout quantization allowance; the 2px rect/layout agreement bound belongs to the runtime algorithm.

Before the fix Chromium passed 11 controls and failed 17 cases with zero reference assertion
failures. That report is retained in `dist/parity-testing/tabs/before-geometry-fix/`. The Tabs-local
helper now accumulates layout offsets/borders and subtracts intermediate scroll, accepting precise
rect candidates only when they agree with layout. It follows the pin's matrix/longhand translation
policy and keeps layout offsets for distorted/nonfinite projections. Existing Angular render hooks,
resize cleanup, native host semantics and the four reviewed exceptions remain unchanged.

`pnpm test-parity tabs --grep 'geometry-|indicator-|direction-'` passes **189 comparisons** across
three engines: 84 geometry rows and 105 existing visibility/direction/identity controls. All **84 new
rows** also pass in Playwright 1.60.0 Noble Linux/arm64, one worker and the original timeout; results
are retained in `dist/tabs-geometry-linux/results/`. The unit suite remains **63 passing tests**.
The current suite contains 140 scenarios / 420 planned rows; earlier full-suite results above retain
their original scope. See [ADR 0078](../../../../docs/adr/0078-tabs-indicator-coordinates.md).

The public Indicator story also checks native selection and physical left/width alignment through
its real CSS transition. All three focused Storybook checks pass against a fresh build; the four
selected SSR checks and library/consumer-bundle builds pass.

Continuous intermediate-scroll and transform-animation tracking, real native realms/shadow trees,
actual hydration and server-visible first paint remain separate verification work.

The runner writes the current browser/version/reference manifest, observations, raw measurements and
HTML report to `dist/parity-testing/tabs/results/`. This local run establishes the documented scope
on macOS; it does not establish real-device, assistive-technology or Linux-specific behavior.

## CI native-scroll precondition

Run [43858922362](https://github.com/radix-ng/primitives/actions/runs/43858922362) failed
`geometry-inner-scroll-rotate` in Linux WebKit: the reference Indicator left was 192px, while the
settled native scroll offset was 80px and the authored layout required 128px. The former coordinate
corresponds to a partial 16px scroll. The driver had waited only for the first nonzero offset before
requesting selection, allowing remeasurement while the native wheel scroll continued. The original
CI artifact is retained in `dist/ci-43858922362/tabs/`.

The driver now observes the authored scroller reaching its native end before F2 changes selection.
It still uses real wheel input, native offsets and literal variable/physical-box assertions. The
reference imports, runtime Indicator and tolerances are unchanged. This is an after-scroll selection
measurement; continuous tracking during scrolling remains outside its certification.

All **84 geometry comparisons** pass across the three macOS engines. Linux/arm64 passes **63 scroll
comparisons** (seven cases, three engines, three repetitions), one worker and original timeouts in
Playwright 1.60.0 Noble; observations are in `dist/ci-43858922362/linux-tabs/results/`. The separate
rapid-keyboard failures were unresolved at that increment; ADR 0083 above records their later fix
and verification. The geometry run alone is not a verdict for the whole Tabs suite.
