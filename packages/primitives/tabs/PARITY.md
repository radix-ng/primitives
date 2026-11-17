# Tabs — Base UI compatibility

Audited 2026-11-17 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
The prepared source digest was validated with `pnpm parity:prepare`.

This is a source/API audit with incremental comparison evidence, not full parity or accessibility
certification. The [Tabs differential suite](../../../apps/parity-testing/primitives/tabs/README.md)
now covers initial values/notifications, Panel exits/focus, activation direction, identities, native activation,
Indicator visibility/resize/coordinates, dynamic collections and arbitrary values: **226 previously certified scenarios, 678 comparisons** across Chromium, Firefox
and WebKit, with no skips. Four exact reviewed fields remain: two for G5's authored-Panel-ID
mismatch and two for G6's hidden Indicator host at null. Whole-Panel presence removes the former
four persistent-Panel-host exceptions. G2's collection consistency and native focus subsets are covered; G1 and G3's direction defects
are resolved; G4's inert/hidden defects and G5's identity defects are resolved for their documented
scope. G6's visibility/observation and measured geometry subsets, G7's arbitrary-identity subset and G8's native keyboard/click/press-release subset are resolved; remaining interaction, lifecycle
and geometry gaps below are not certified by these increments.
The keyboard matrix now defines **64 scenarios / 192 rows**, including the native Tab render
boundary and outgoing-Panel exit frame in [ADR 0083](../../../docs/adr/0083-tabs-native-tab-render-boundary.md).
The preceding complete suite passed **290 scenarios / 870 comparisons** across all three engines on
Linux/arm64 in Playwright 1.60.0 Noble, with two workers and the original timeouts. All **81 rapid
comparisons** also pass on macOS. Ordinary unhandled-arrow page scrolling remains unstable in macOS
WebKit, including a framework-free HTML control; see the suite notes for that platform's limits.
The hydration increment adds **14 scenarios / 42 comparisons**, all passing on macOS and Linux/arm64.
The subsequent G8 gesture/form increment adds **44 scenarios / 132 planned rows**: 116 supported
comparisons pass on macOS and Linux/arm64, with 16 explicit native-input capability skips.
The suite now defines **348 scenarios / 1044 planned comparisons**; the 870-row verdict above is
historical, not a fresh full 1044-row run. Four CSR exception fields remain; fourteen exact
before-hydration ARIA relationship pairs record the server-registration policy described below.

**Pinned covered** means the stated subset passed direct Angular/Base UI comparison;
**Regression covered** below means an existing Angular check exercises the stated subset;
**source gap** means the implementations differ by inspection and need a focused comparison;
**pending** means the evidence does not establish the behavior. Documented Angular adaptations are
listed separately from unresolved gaps.

| Contract                                                                                 | Evidence                                                                                                   | Status                                                                                                                 |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Root / List / Tab / Panel / Indicator part set                                           | Public barrels and all five pinned parts                                                                   | Present; Angular directives and `hostDirectives` composition                                                           |
| `value`, `defaultValue`, horizontal default orientation                                  | Pinned initial-value suite; null/default units; orientation source                                         | Pinned covered for numeric/string defaults and controlled `null`; G1 resolved                                          |
| Implicit value `0`, initial notification and disabled-first fallback                     | Pinned initial-value suite; three implicit-default units                                                   | Pinned covered, including a later value-0 tab, missing `0`, all disabled and uncancelable initial fallback             |
| Explicit disabled default and later disable/re-enable                                    | Pinned initial-value and collection suites                                                                 | Pinned covered through enable/disable and initial-default honor transitions                                            |
| Selected uncontrolled tab becomes disabled                                               | Implicit-default unit                                                                                      | Regression covered; first enabled value, reason `disabled`, direction `none`                                           |
| Missing selected tab, empty/refilled/replaced lists, all disabled                        | 36 pinned collection cases; rendered registration phases                                                   | Pinned covered for removal, refill, List replacement/absence, disabled fallback and native focus, G2                   |
| Controlled initial/external values; parent ignores a request                             | Twenty pinned controlled-owner cases; direction and collection suites                                      | Ignored, delayed, transformed and canceled requests covered; controlled input owns selection                           |
| Click selection, same-value no-op and cancel before commit                               | Forty pinned activation cases; eight activation units                                                      | Pinned covered for native requests, canceled retry, repeat and same-value no-op                                        |
| Event reasons, native event, trigger and callback order                                  | Pinned capture/bubble/change timeline, native event metadata and raw trigger data                          | Type/trust/target/modifiers/order covered; optional Angular trigger retained, ADR 0075                                 |
| Manual activation by default; automatic activation on focus                              | Pinned keyboard matrix, both axes and directions                                                           | Pinned covered for settled navigation and controlled acceptance/ignore/delay                                           |
| Home/End, looping and `loopFocus=false`                                                  | Pinned keyboard matrix, 16 axis/direction/activation/loop combinations                                     | Pinned covered for both boundaries, wrapping and disabled destinations                                                 |
| Vertical Up/Down, horizontal RTL and modifier keys                                       | Pinned keyboard matrix and native key records                                                              | Pinned covered; Shift/Ctrl/Alt/Meta/combined vertical arrows preserve native defaults                                  |
| Disabled tabs remain arrow-focusable without activation                                  | Pinned disabled button/div/link key/click cases; state and focus units                                     | Pinned covered for primary native defaults/navigation, horizontal entry and supported touch/pen taps                   |
| Disabled controlled selection preserves the existing Tab entry                           | Selected-disabled unit; pinned collection cases                                                            | Disabled selection preserves Composite's tab stop; dynamic disabled/focus subsets covered                              |
| Native Tab / Shift+Tab into list, panel and adjacent controls                            | Pinned keyboard/held-exit cases and projected wrapper                                                      | Native forward/reverse order covered, including consecutive selection/Tab within one frame                             |
| `role`, `aria-selected`, orientation and reciprocal IDs                                  | Fifteen pinned identity cases, seven identity units and native SSR relationships                           | G5 covered for registered/authored identities; authored-ID adaptation only                                             |
| Per-part `data-orientation`, `data-activation-direction`, Tab active/disabled attributes | Pinned direction suite, first sampled frame, host bindings and selected-state units                        | G3 direction covered on Root/List/Tab/Panel and non-null Indicator; live orientation/style combinations pending        |
| Panel indexes and active/inactive tabindex                                               | Composite-index unit; pinned Panel snapshots                                                               | Index regression covered; active/inactive tabindex pinned covered in lifecycle cases                                   |
| Panel unmount / `keepMounted`                                                            | Nine presence units; twelve pinned lifecycle cases                                                         | Whole-Panel host/child lifetime covered, G4; no structural-host exception                                              |
| Panel enter/exit attributes, hidden timing, inert contents and interrupted transitions   | Twelve pinned cases and public keyframe browser regression                                                 | G4 fixed for documented retained/structural exits; deeper lifecycle follow-ups remain                                  |
| Indicator six `--active-tab-*` variables and common state attributes                     | 45 pinned visibility/resize/geometry cases; direction and custom-ID controls                               | Measured border/scroll/transform geometry, role/hidden and CSS precision covered                                       |
| Indicator custom tab ID, absent/zero-size selection, resize and List replacement         | Pinned visibility/resize cases; three observer lifetime units                                              | G5 lookup and G6 visibility/observation covered; null retains a hidden Angular host                                    |
| Indicator scroll, borders, scale/transforms and intermediate scroll containers           | 28 pinned geometry cases; literal variables and native bounds                                              | G6 covered at render/selection checkpoints; continuous motion/scroll remains pending                                   |
| Tab/Panel value domain and unique identity                                               | Public value types; pinned mixed numeric/string identities                                                 | G7 covered for reference identities, mixed/falsy values, callbacks and native relationships                            |
| Custom/native hosts, keyboard activation and disabled links                              | 84 activation cases on button/div/link/anchor hosts, including supported native gestures                   | G8 covered for keyboard/click, native forms, auxiliary links, removal mid-press and supported touch/pen                |
| Projected parts through a host-composed Root                                             | Five wrapper units and one Chromium Storybook scenario                                                     | Regression covered; Root must stay in the declaring injector tree                                                      |
| List destruction/recreation and stale registration cleanup                               | Wrapper lifecycle units and pinned collection cases                                                        | Selection survives List absence and populated replacement; whole-Root disposal follow-ups remain                       |
| Nested Roots, multiple instances and use inside Dialog/Popover                           | Pinned independent-Root identities; separate consumer experiment                                           | Independent identities covered; nested/overlay consumers pending                                                       |
| SSR rendering, hydration metadata and native ID relationships                            | 26 SSR checks; 14 real SSR/hydration cases in three engines                                                | Full-bootstrap node/ID reuse, input/focus preservation, initialization callbacks and post-hydration activation covered |
| Indicator `renderBeforeHydration` / server-visible positioning                           | Real browser pre-bootstrap snapshots, strict CSP, axes/RTL, zero-size/transform and multiple-Root controls | Opt-in first paint covered; visible Indicator is preserved through hydration                                           |
| Physical touch/pen devices, assistive technology and axe                                 | Not exercised by the checks run here                                                                       | Pending                                                                                                                |

## Documented Angular adaptations

- All five parts attach to consumer-owned hosts. React `render`, ref and state-dependent
  `className`/`style` callbacks are replaced by Angular composition, native bindings and exported
  directives; a React store or ref implementation is not a requirement. See
  [framework adaptation](../../../docs/engineering/mechanisms/framework-adaptation-during-parity-work.md).
- Ordinary Panel hosts stay mounted. `*rdxTabsPanelPresence="value"` on the Panel host owns its
  entire Angular view and destroys it after exit; `keepMounted: true` retains the entire view and
  child state. The structural owner supplies value and a stable generated ID. [ADR 0077](../../../docs/adr/0077-tabs-whole-panel-presence.md)
  supersedes the former empty-host adaptation from ADR 0074 and removes its four exception fields.
- Projected tabs resolve the inner List through the Root's Composite owner bridge. The Root must be
  on the wrapper host, in the projected parts' declaring injector tree. This follows
  [ADR 0001](../../../docs/adr/0001-angular-composite-navigation-layer.md).
- `onValueChange` emits `{ value, eventDetails }`. Root exposes a `value` input through `valueInput`,
  a readonly effective `value()` signal, and explicit `valueChange` output. Defined inputs own selection;
  accepted requests do not commit locally in controlled mode. `[(value)]` stays supported through
  input/output binding. Consumers can reject requests with `cancel()` or retain their current input.
  See [ADR 0081](../../../docs/adr/0081-tabs-controlled-selection-ownership.md) for migration.
- Change details retain Angular's optional initiating native `trigger`; pinned Tabs leaves it unset.
  G8 asserts each policy and retains it in raw measurements. Equal trigger availability is outside
  the native callback equivalence. See [ADR 0075](../../../docs/adr/0075-tabs-native-activation.md).
- Indicator retains its consumer-owned host at null and hides it, while the pin omits its element.
  Two exact host fields retain this difference; actual visibility and geometry still compare.
  See [ADR 0076](../../../docs/adr/0076-tabs-indicator-observation.md).

- SSR publishes native Tab/Panel ARIA relationships before JavaScript in Angular. The pinned Base UI
  implementation registers these links during hydration. Fourteen exact `relationships` pairs in
  the hydration suite retain this server behavior; all hydrated links remain compared. Raw IDs and
  DOM are recorded, and each framework must preserve its actual IDs through hydration.

## Source gaps and required comparisons

G1, G3's direction defects, G4, G5, G6's visibility/observation and G8's native-activation subset were reproduced and fixed through direct comparison. G5 and G6 have
exact reviewed differences documented below. The remaining findings are not reviewed
differential exceptions; each needs a focused reproducer before an exact exception or runtime change
is accepted.

### G1 — Resolved: preserve explicit `defaultValue=null`

[Root](src/tabs-root.ts) previously used `defaultValue ?? 0`, replacing valid explicit `null` with the
implicit numeric default. Before the fix, direct Chromium comparisons reproduced selection of the
value-0 tab or fallback to a string tab with reason `missing`. The
[pinned Root](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs/root/TabsRoot.tsx)
kept no selection and emitted nothing. Root now defaults only `undefined` to `0`.

Both null-default cases pass on all three engines, alongside explicit `value=null` overriding a
non-null default. Two unit regressions additionally check that changing `defaultValue` later does not
replace the initial null choice. The complete initial-value suite passes 33 comparisons with no
exceptions. Panels are retained on both sides with `keepMounted=true`; this result does not certify
unmounting or exit focusability. See the [suite notes](../../../apps/parity-testing/primitives/tabs/README.md).

### G2 — Rendered collection consistency and native focus covered

[Composite registration](../composite/src/composite-list-item.ts) now runs in `earlyRead`, after
Angular has updated its views. List publishes the completed map in `write`; Root reconciles the
uncontrolled selection in `read`. Previously the delayed registration exposed partial/empty maps,
so replacing a selected Tab or populated List could commit an unwanted fallback or `null`.

Removing the selected value falls back to the first enabled value with reason `missing`; disabling
it uses `disabled`. Removing the final Tab, emptying a previously populated List, or disabling every
Tab selects `null`. Refilling/re-enabling does not choose a value from an existing null selection.
Whole-List absence preserves selection, as does replacing its native host with a populated List;
replacing it with an empty List clears selection. Controlled values are not automatically corrected.
Explicit disabled defaults remain honored until enabled, then use the normal disabled fallback.
Automatic consistency changes keep direction `none` and cannot be vetoed with `cancel()`.

Composite preserves the highlighted native element as its index changes, keeps an eligible same-index
replacement, and chooses an eligible fallback if necessary. It also preserves existing native focus
when Angular moves that same connected view, using observed removal/reinsertion records. Destruction,
deliberate blur and focus moved to another control do not reclaim focus. Tabs distinguish this
restoration from a new automatic-activation request, including a previously canceled request.
No runtime timeout, platform branch, extra selection state or differential exception is added.
See [ADR 0079](../../../docs/adr/0079-tabs-collection-consistency.md).

The 36 `collection-*` cases compare rendered selection, Panel state, native focus, every tab's
`tabindex`, direction and the exact callback trace through these lifecycles, including repeated
reordering, automatic/canceled activation and vertical RTL. Raw DOM/IDs/IDREFs/native events remain
available; resolved identity equivalence while the entire List is absent is outside this increment.
The initial 34-case Chromium baseline had **10 failures / 24 passes**, with no reference assertion
failures, retained in `dist/parity-testing/tabs/before-collection-fix/`.

### G3 — Resolved for direction: external values, geometry and pending destinations

[Root](src/tabs-root.ts) derives activation direction from its effective selected value with `linkedSignal` and
publishes a readonly computed direction to the parts. Render hooks collect physical layout; a new
destination retains the committed origin until its geometry is available, then corrects the value
fallback. Equal coordinates return `none`, and automatic consistency updates explicitly reset the
direction. Accepted requests retain their event's live geometry; cancellation leaves the origin alone.
Uncontrolled requests and fallback publish actual selection/direction before `valueChange` subscribers.
Controlled requests describe requested direction in event details; rendered direction follows the input.

Seventeen pinned cases cover horizontal/vertical LTR/RTL, external changes after cancellation and
accepted native requests, null/restore, equal positions with native Enter, same-update insertion with
numeric and out-of-order string values, focus inside/outside, disabled fallback and missing values.
Every Root/List/Tab/Panel direction and the non-null Indicator direction is compared, alongside actual
selection, focus, tabindex, notifications and the first sampled frame for the new value. These cases
pass 51 comparisons across three engines; the initial pre-fix matrix failed 15/17 Chromium cases.

The missing-value cases retain the pin's actual committed-origin policy: `Overview` → `Missing` →
`Unknown` → `Overview` reports `left`, `right`, `right`. A root initially selecting a missing value
reports `none` when both endpoints are absent. Raw frame/DOM/rect evidence is retained; no exception
or adapter rewrites these values. See the [suite notes](../../../apps/parity-testing/primitives/tabs/README.md).

Twenty additional `controlled-*` cases now cover ignored/repeated requests, delayed acceptance,
parent replacement/null, cancellation, automatic focus requests, RTL/both axes, object/function
identities, null/missing/disabled inputs and whole-Panel presence. Native Enter/F-keys change only
application inputs and pending requests. Every part's direction, actual focus/tab stops, Panel state,
Indicator visibility/variables and callbacks compare. The two-way public story verifies acceptance
and cancel-before-output through actual `[(value)]` syntax.

A defined input owns selection. Root uses a computed effective value and one private uncontrolled
signal, replacing the writable model and internal/external-write heuristics. `valueChange` emits
accepted requests and automatic uncontrolled changes, not external input updates or explicit default
initialization. Ignored controlled requests preserve actual selection and committed direction;
parent replacements use their actual destination. The rendered state of delayed acceptance updates
only when its input arrives. Control-mode switching through undefined remains outside the certified
scope. See [ADR 0081](../../../docs/adr/0081-tabs-controlled-selection-ownership.md).

Live axis/style changes in the same update and transition-frame transforms remain follow-ups.

### G4 — Resolved for retained/structural exits: inert contents and hidden timing

[Panel](src/tabs-panel.ts) is immediately inert whenever inactive. Retained hosts become hidden
when their actual exit ends. [TabsPanelPresence](src/tabs-panel-presence.ts) owns the complete native
Panel and Angular child view through `TemplateRef`/`EmbeddedViewRef` and the shared `useRenderLifecycle`.
Its context supplies value, mounting policy, transition history and an ID that survive native view recreation. Root
registration follows actual host lifetime, and the context cannot leak into a nested Tabs Root.

Twelve pinned cases cover immediate/held/natural exits, full-view unmounting/retention, interrupted
reselection, native Tab order, rejected outgoing focus/pointer requests, fresh state on return,
retained state with keepMounted, Root removal during exit and removing a closed retained view.
All 36 lifecycle comparisons pass across three engines. Six new units check Angular child lifetime,
ID stability, disposal and nested Root scope, alongside the original three presence units.
Completed-exit cases also observe actual starting-attribute mutations on new/retained hosts;
the structural owner preserves their enter phase across view destruction. The remount case failed
before moving the transition ref to that owner, with all reference assertions passing.

The public keyframe regression covers descendant-only motion before whole-Panel removal and
recreation. Angular's descendant-aware exit wait is an existing capability; the pin waits on its
Panel element. Later-finishing/replaced descendant motion, further live-policy combinations and
actual hydration remain follow-ups. See [ADR 0077](../../../docs/adr/0077-tabs-whole-panel-presence.md).

### G5 — Resolved for registered native identities

[Tab](src/tabs-tab.ts) and [Panel](src/tabs-panel.ts) use per-instance owned `injectId` identities and
accept authored `id` inputs. Values no longer form IDs, so numeric `1` and string `'1'` cannot collide.
Changing a value keeps the instance ID; replacing a part creates a fresh ID. Root registers actual
Panel IDs by value and uses owner tokens so stale cleanup cannot remove a newer registration. Latest
registration wins; removing that owner does not restore a shadowed registration. Hidden-state changes
can register a retained panel again, following the pin's lifecycle.

Native Tab registration supplies labels during SSR and filters stale Composite entries. Client label
lookup prefers Composite DOM order. Removing a native Tab/Panel removes its IDREF. Indicator resolves
the selected registered Tab element instead of reconstructing an ID; its custom-ID width follows
authored/reactive IDs. The rest of G6 remains separate.

Fifteen cases cover absent/retained parts, authored/reactive IDs, replacement and registration
ownership, Tab/Panel value edits, independent Roots, mixed numeric/string values, structural presence
and Indicator lookup. Before the fix, **13/15** Chromium cases failed with all reference assertions
passing. The full increment passes **45 comparisons**, alongside seven new units and a native SSR
relationship regression. Actual IDs/IDREFs remain in raw DOM; comparisons resolve native targets,
check uniqueness and track instance identity/reuse.

[ADR 0074](../../../docs/adr/0074-tabs-native-identities.md) retains two authored-Panel-ID exception
fields: Angular registers the actual authored ID where the pin leaves a dangling generated-ID
reference. [ADR 0077](../../../docs/adr/0077-tabs-whole-panel-presence.md) removes the former four
persistent-host fields after comparisons report all four stale, with no assertion failures or
unexpected differences. The identity presence case now also verifies return/remount with the same
structural owner ID. Imperative DOM-ID mutation, cross-root moves and actual hydration remain follow-ups.

### G6 — Visibility, observation and measured geometry covered

[Indicator](src/tabs-indicator.ts) measures the registered selection after rendering and observes
the current List and every tab. Collection/List changes and destruction disconnect the old observer.
It exposes `role=presentation` and hides missing/zero-size geometry. At null, Angular retains its
hidden host while the pin omits its element; two exact `hosts` fields record that adaptation.
Computed CSS dimensions retain native precision, and opposite-edge distances use content dimensions.

Seventeen pinned cases compare both axes, null/missing/hidden/zero-size selections, active/sibling/
label/List resize, tab replacement/insertion, List replacement followed by resize, multiple
indicators and removal/recreation followed by resize. All six variables, physical alignment,
visibility, host semantics and unchanged selection/notifications are observed. All 51 new comparisons
pass across three engines, with 54 existing direction/identity controls. Three units verify observer
ownership and cleanup, including a surviving Angular Indicator across List replacement. Before the
fix all 17 new Chromium cases and two of those units failed, with no reference assertion failures.
See [ADR 0076](../../../docs/adr/0076-tabs-indicator-observation.md).

Twenty-eight additional geometry cases compare border/padding and content-box sizing, fractional
layout, both scroll axes in LTR/RTL, nonuniform scale, rotation, flip, skew, perspective and zero
scales, Tab-local matrix/percentage/combined translation and rotation/scale, nested offset parents
and intermediate scrollers. Before the fix **17/28 Chromium cases failed**, with no reference
assertion failures. [The geometry helper](src/tabs-indicator-geometry.ts) now follows the pin's
layout/rect agreement policy, correcting borders, scale and intermediate scroll while preserving
subpixel CSS precision. Distorted/nonfinite rect candidates retain layout offsets; Tab-local
translations are followed. Core DOM guards support composed parent traversal without a new peer.

All 84 new rows and 105 affected Indicator/direction/identity controls pass across three engines
(**189 comparisons**). All 84 new rows also pass in Playwright 1.60.0 Noble Linux/arm64. Native wheel
input changes actual scroll, then consumer F2/F3 selection causes a render. Expected coordinates
use authored fixed slot sizes/gaps, while raw native rects and literal variables remain recorded.
For Tab-local rotation/scale, a passive native slot checks the expected layout-sized indicator.
No exception is added. See [ADR 0078](../../../docs/adr/0078-tabs-indicator-coordinates.md).

Continuous inner-scroll tracking without a render, animation-frame transforms, real owner-document/
shadow integrations, actual hydration and Indicator first paint remain unverified. That geometry increment did not introduce `renderBeforeHydration`; the later hydration increment below adds it.

### G7 — Arbitrary identity values covered; breaking public type widening

[Public types](src/utils.ts) now use `unknown` for `RdxTabsValue`, including Root inputs/effective state,
Tab/Panel values, presence and event payloads. This matches the pin's value domain while keeping
application handlers responsible for narrowing a received value before writing narrower typed state.
The [object-value example](stories/tabs-object-values.ts) shows that migration without casting.
Objects, arrays, functions and symbols preserve reference identity; equal fields or symbol descriptions
do not make separate values equal. Functions are stored and emitted, never invoked as setters.

Thirty `values-*` cases compare uncontrolled defaults, implicit function fallback, controlled native
requests and external updates, missing object defaults, exact callback identities/cancellation,
selected removal, refill, disabling, whole-Panel presence, native IDs/IDREFs and Indicator state.
They cover objects/arrays with equal contents, distinct functions/same-description symbols, bigint,
boolean, falsy/mixed values, null, explicitly bound undefined and signed zero. Opaque objects throw
if coerced; counters and original callback-reference assertions prove no coercion/function calls.
Each fixture builds its own catalog once; snapshots retain type/nullish markers and Object.is
membership alongside real native relationships, focus, direction, literal variables and raw DOM.

A private Panel sentinel distinguishes an omitted input from a legitimate bound undefined. Missing
ordinary Panel inputs still produce the same diagnostic; inherited undefined works through presence.
Direction measurements now omit NaN, which cannot match the pin's strict-equality Tab lookup;
Map's SameValueZero lookup had incorrectly supplied its physical position for a canceled request.
Two new unit regressions fail against the old runtime and pass after these fixes.

Root still reserves initial undefined for uncontrolled/default semantics; a controlled undefined
mode switch is not certified. Null/undefined selections hide Indicator, retaining the existing hidden
Angular-host adaptation. An authored null Tab/Panel matches selected null by ===. Zero and negative
zero share one identity; duplicates are not supported. NaN is covered only as a canceled request
with its original payload and direction; it is not certified as a selected identity. See
[ADR 0080](../../../docs/adr/0080-tabs-arbitrary-value-identities.md).

The 90 new comparisons and 240 affected collection/direction/identity/Panel controls pass on all
three engines (**330 comparisons**). Tabs units pass **75 tests**, including 12 value tests; four
fresh Storybook checks and five SSR markup/identity checks pass. No new differential exception is
added. Actual hydration, controlled mode switching and imperative ID mutation remain follow-ups.

### G8 — Resolved for native keyboard/click activation and secondary release

[Tab](src/tabs-tab.ts) now requests selection from click or automatic focus. Native button/link Enter
belongs to the browser; custom-host Enter and composite Space dispatch clicks through the owned core
utility, preserving modifiers. Space prevents scrolling and its native button keyup default, so a
canceled request cannot be retried in the same physical press. Descendant activation keys keep their
own defaults. Disabled tabs suppress primary defaults without native disabling, including primary link navigation.
Automatic activation uses actual focusin; pending press listeners release together on up/cancel/destroy.

Forty cases compare button/div/link/anchor hosts, Enter/Space/repeat, canceled/accepted physical
requests, selected-tab no-ops, modifiers, prevented Enter, disabled key/click defaults, descendant
keys, form non-submission and held right/middle presses followed by native arrow focus. Capture/
bubble/change order, native event type/trust/target/modifiers, selection, tabindex, focus, hash and
scrolling are compared. Before the fix **40/40** Chromium cases failed with zero reference assertion
failures. Eight new units failed before the fix, including paired listener disposal.

[ADR 0075](../../../docs/adr/0075-tabs-native-activation.md) preserves Angular's optional initiating
native trigger. Its actual value is retained in raw measurements and asserted independently of the
reference's unset property; equal trigger availability is not certified. The original 120 activation
comparisons add no differential exception.

The 2026-11-17 increment adds 44 cases: 22 native form/type cases (including canceled selection),
eight middle/modified-link cases, four removal/recreation cases during secondary presses,
four touch taps, two native touch cancellations and four pen taps. Root selection, focus, tab stops,
raw capture/bubble/change events, native trust/pointer metadata, form submit/reset effects, input
reset value and actual new browsing-context destinations compare. Cancellation of selection alone
does not cancel a native submit/reset action.

Four isolated keyboard baselines failed only in Angular before the type fix; the unmodified pin
passed every reference assertion (`dist/parity-testing/tabs/g8-form-before/`). Tab now exposes a
`type` input, default `button`, preserving authored `submit` and `reset`. No manual form action,
event redispatch or new selection mechanism was introduced.

The complete activation subset passes **236 comparisons**, with **16 capability skips**, on macOS.
The 44 added cases pass **116 comparisons / 16 capability skips** on Linux/arm64 in Playwright
1.60.0 Noble with two workers and original timeouts. Touch taps run in Chromium/WebKit; Firefox
cannot create Playwright touch contexts. Touch cancel and pen input run through Chromium CDP;
Firefox/WebKit have no corresponding public input API. A trusted `pointercancel` is required,
and a subsequent native activation must work. These checks do not certify physical devices.

Like the pin, disabled links block selection and primary navigation but retain native middle-click
navigation. Both sides' actual new page and destination are observed. WebKit suppresses the click
following a prevented disabled touch press; Chromium delivers a prevented click. Each engine's
native events remain literal and compare without exceptions. The four CSR reviewed fields are
unchanged. Native OS context menus, touch scrolling/long presses, pen auxiliary buttons, browser
shortcuts and physical-device/AT behavior remain follow-ups.

### Keyboard matrix — native Tab boundary and exit frames

The 64-case matrix compares both axes/directions, activation/loop policies, disabled positions,
controlled policies, modifiers and native forward/reverse order through Panels and their controls.
Eight facade cases declare List and Panels in separate components while the parent owns the input.
Immediate manual arrow/Tab and vertical retained/structural cases extend the original fifty cases.

A private Tabs coordinator marks an owned click/focusin until Angular renders. If an unprevented
Tab arrives in that window, it invokes the application's public tick before the browser computes
its destination. It leaves original input, default prevention and focus navigation unchanged.
Root retains parent-owned controlled selection. Ordinary rendered interactions and another List's
pending work do not trigger a tick; a shared guard prevents recursive application synchronization.
Consumers need no configuration. The application pass can process other dirty views.

Outgoing Panels also retain the pin's first exit frame: inactive contents are inert and removed
from Tab order immediately, while visibility/removal awaits that frame and any CSS exit. Structural
Presence observes CSS at its original boundary and delays only physical removal through an optional
owner hold. Reopening, explicit completion and disposal retain their defined lifetimes.

Rapid comparisons pause the shared clock before the real key pair, advance it only after both keys
and resume before checking settled state. This compares equivalent paint phases without supplying
state, focus or callbacks. Native page scroll remains compared. The original 146/150 macOS and
143/150 Linux reports preserve the pre-fix race; early synchronization/phase experiments preserve
867/870 and 79/81 results with timing-dependent scroll differences. All 678 existing controls pass;
the matched-frame rapid rerun passes 81/81 on both macOS and Linux/arm64. See the [suite notes](../../../apps/parity-testing/primitives/tabs/README.md#keyboard-navigation-and-consecutive-native-input)
and ADR 0083 for the exact scope, paths and final keyboard/Linux results. No new exception is added.

### SSR → hydration and first-paint Indicator

The pinned browser fixture now performs actual `renderApplication`/`provideClientHydration` and
React `renderToString`/`hydrateRoot`. Each side receives repeated HTTP requests before a fresh
browser starts. Blocking only the external client modules exposes SSR DOM and the pre-bootstrap
Indicator. The driver verifies native node identity, exact ID preservation, input value/focus,
initial callbacks and a real click/Tab handoff after hydration.

The negative baseline reproduced Angular IDs changing during hydration after earlier SSR requests.
`RdxIdGenerator` now owns its counters per application injector, preserving the same creation
sequence across requests and the client. Applications in one document use distinct `APP_ID` values.

[ADR 0085](../../../docs/adr/0085-hydration-owned-identity-and-view-ranges.md) extends this correction:
native owners recover their serialized IDs when sibling `@defer` islands hydrate in reverse order.
Transferred high-water counters reserve IDs for server islands before new client content is created.
The SSR browser regression also covers structural Panel Presence and preserves its label/Tab targets.

Indicator adds `renderBeforeHydration`, default `false`. Its CSP-aware server script positions
eligible active tabs before the client bundle loads. Angular's public TransferState serialization
hook emits the script outside the application's annotated DOM; the script leaves the application
node structure intact. Existing inline geometry seeds the first client binding, preserving visible
state until normal render measurement takes over. See the follow-up in
[ADR 0076](../../../docs/adr/0076-tabs-indicator-observation.md).

All **42 comparisons** pass across Chromium/Firefox/WebKit on macOS and Linux/arm64, including
retained/structural Panels, controlled/null/implicit values, authored Tab IDs, multiple Roots,
vertical/RTL first paint, transformed/zero-size targets and strict nonce CSP. All 26 SSR checks,
124 focused units, library and SSR-app builds pass. Affected CSR controls pass **177 comparisons**
(Indicator observation, native identities and rapid/composed keyboard input). The CSR reviewed
fields remain unchanged; server relationship exceptions are exact and limited to the pre-bootstrap
checkpoint.

This covers full application hydration with matching creation order. Incremental/deferred or
streamed hydration, arbitrary cross-process value identities and native shadow/realm combinations
remain separate follow-ups. Continuous Indicator motion remains outside this increment.

## Verification and limits

Checks run for this audit on Node 24.22.2:

- Native Tab render-boundary increment: **870/870 passed** in Linux/arm64 Playwright 1.60.0
  Noble, all 290 scenarios across Chromium/Firefox/WebKit, two workers and original timeouts.
  Report: `dist/tabs-render-linux/results/`. macOS: **81/81 rapid comparisons passed**;
  ordinary WebKit scroll variation and its framework-free control are documented in the suite.
- Affected Tabs/Presence/Portal/Menu/Context Menu/Menubar/Popover/Select units: **704 passed**,
  including **95 Tabs tests**. Seven selected SSR checks, library build, consumer-skill generation,
  parity typecheck, scoped lint, formatting and contributor checks pass.

- Historical pre-fix keyboard native-input baseline: `pnpm test-parity tabs --grep keyboard-` — **146 passed,
  four failed**, strict Angular/React fixture build and shared runner checks passed. All failures
  are Angular rapid handoff in Chromium; no reference assertion failures. The existing Tabs unit
  suite remains **83 passed**. This result does not certify rapid handoff.
- Historical pre-fix keyboard Linux/arm64 baseline: **143 passed, seven failed**, original timeouts and one worker
  against the same built fixtures; all failures are Angular rapid handoff in Chromium. No reference
  assertion failures or capability skips. Scoped lint, formatting and contributor checks pass.

- Controlled ownership increment: `pnpm test-parity tabs` — **678 passed**, all 226 scenarios across
  Chromium/Firefox/WebKit, including 60 new controlled rows, strict fixture build and 13 shared
  infrastructure checks. Current observations are also preserved in `dist/parity-testing/tabs/controlled-final/`.
- Linux/arm64: **69 passed** (60 new controlled rows and nine existing controlled-collection
  controls), Playwright 1.60.0 Noble, one worker and original timeouts, retained in
  `dist/tabs-controlled-linux/results/`.
- Controlled ownership units: **83 passed**, including eight new ownership tests. The synchronous
  observer regression now distinguishes controlled request outputs from actual uncontrolled commits.
- Fresh Storybook: **5 Chromium checks passed**, including two-way acceptance/cancellation, the
  typed object consumer, Indicator, whole-Panel keyframes and projected wrapper. Five selected SSR
  checks, library/SSR-app builds, scoped lint and consumer-skill regeneration pass.

- Consumer API metadata retains `twoWay: value` for the ordinary input/output pair; seven focused
  generator checks pass alongside consumer-bundle regeneration.
- G7: `pnpm test-parity tabs --grep 'values-|identity-|direction-|collection-|panel-'` —
  **330 passed**, including 90 new arbitrary-value rows and 240 controls, strict fixture build and
  13 shared runner checks. The suite now has 206 scenarios / 618 planned rows; earlier full runs
  below retain their original scope.
- G7 Linux/arm64: **90 passed** in Playwright 1.60.0 Noble with one worker and original timeouts,
  retained in `dist/tabs-values-linux/results/`.
- G7 units: **75 passed**, including 12 arbitrary-value checks. Against the previous runtime, two
  of the new units fail (explicit undefined Panel and NaN request direction), ten pass.
- G7 fresh Storybook: **4 Chromium checks passed** (typed object-value consumer, Indicator,
  whole-Panel keyframes and projected wrapper). SSR: **5 selected checks passed**, including actual
  object/function/undefined native relationships and no function calls during server rendering.
- G7 library/SSR-app builds, scoped lint and consumer-skill regeneration pass. These server checks
  do not establish client hydration or arbitrary-value transfer across server/client processes.

- G2 increment: `pnpm test-parity tabs --grep collection-` — **108 passed** (36 scenarios,
  Chromium/Firefox/WebKit), strict fixture build and 13 shared runner checks. At the G2 increment the suite contained
  176 scenarios / 528 planned comparisons; earlier full-run counts below retain their scope.
- G2 Linux/arm64: **108 passed** in Playwright 1.60.0 Noble, one worker and original timeouts,
  retained in `dist/tabs-collection-linux/results/`.
- Shared Composite consumers: **731 unit tests passed**, five pre-existing skipped cases, across
  Composite, Tabs, Accordion, Menu/Context Menu/Menubar, Navigation Menu, Radio, Toolbar, Select,
  Slider and Toggle/Toggle Group. The Tabs suite remains 63 tests; Composite has 31 tests.
- Fresh Storybook: **10 Chromium browser checks passed**, covering Composite reorder, Tabs
  Indicator/Panel/projected wrapper, Menu/async submenu keyboard ownership, Menubar and Navigation Menu.
- Select dynamic collections: `pnpm test-parity select --grep 'dynamic|async|collection'` —
  **33 passed** across all three engines, covering the shared registration/value-collection change.
- G2 library build, consumer-skill generation, scoped lint and contributor-document checks pass;
  four selected SSR markup/identity checks pass. These do not certify actual hydration.

- `pnpm parity:prepare` — Base UI 1.9.0 pin and cached content digest validated.
- `pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/tabs/__tests__`
  — **63 passed**, including six whole-Panel lifetime/ownership tests, three Indicator observation/cleanup checks, eight native-activation regressions, seven native-identity regressions, null-default, Panel inertness, direction
  regressions and synchronous selection/direction publication (the model API is superseded by ADR 0081).
- Current geometry increment: `pnpm test-parity tabs --grep 'geometry-|indicator-|direction-'`
  — **189 passed**, including 84 new geometry rows, strict fixture build and 13 shared runner tests.
  The suite now contains 140 scenarios / 420 planned comparisons; the previous full-run count below
  retains its scope. Chromium baseline: **17 failed / 11 passed**, all reference assertions passed,
  retained in `dist/parity-testing/tabs/before-geometry-fix/`.
- Geometry Linux/arm64: **84 passed** in Playwright 1.60.0 Noble, one worker and original timeout,
  retained in `dist/tabs-geometry-linux/results/`.
- Previous whole-Panel full run: `pnpm test-parity tabs` — **336 passed**, 112 scenarios across three
  engines, with four exact reviewed fields. Strict fixture build and 13 infrastructure checks pass.
- After final input metadata cleanup: **48 affected Panel/identity comparisons passed** on macOS
  and **48 passed** in Playwright 1.60.0 Noble Linux/arm64 with one worker and the original timeout.
  Linux observations remain in `dist/tabs-panel-owner-linux/results/`.
- Previous G8 full run: `pnpm test-parity tabs` — **273 passed** (91 initial-value/Panel/direction/identity/activation scenarios × three engines), strict fixture
  compilation/build and the shared runner's 13 infrastructure tests passed. The initial Chromium run
  before the runtime fix passed nine cases and failed both null-default cases; its reports/traces are
  retained locally in `dist/parity-testing/tabs/before-null-fix/`.
- `pnpm test-parity tabs --grep 'indicator-|direction-'` — **105 passed**: 51 new Indicator rows
  and 54 affected direction/identity controls. Strict fixture compilation/build and 13 shared
  infrastructure tests passed. The suite at that increment contained 108 scenarios / 324 planned comparisons;
  the earlier full-run verdict above is unchanged. Initial G6 Chromium baseline: **17 new failures**
  with no reference assertion failures, retained in `dist/parity-testing/tabs/before-indicator-fix/`.
- Additional G6 Linux/arm64 browser pass: **54 passed** (51 Indicator comparisons plus three
  custom-ID controls) in Playwright 1.60.0 Noble with one worker and the original timeout. Raw
  results are retained in `dist/tabs-g6-linux/results/`. A matching three-engine macOS label check
  passes after correcting the rendered-box assertion precision; variable comparison stays exact.
- Panel cases before the G4 fix: **1 passed / 7 failed** in Chromium, retained in
  `dist/parity-testing/tabs/before-panel-fix/`.
- Initial direction cases before G3: **2 passed / 15 failed** in Chromium, all reference assertions
  passed; preserved in `dist/parity-testing/tabs/before-direction-fix-reference-checked/`. Native
  equal-coordinate and accepted-request assertions were added afterward; the saved verdict is unchanged.
- Initial identity cases before G5: **2 passed / 13 failed** in Chromium, all reference assertions
  passed; preserved in `dist/parity-testing/tabs/before-identity-fix/`.
- Activation cases before G8: **40 failed**, zero reference assertion failures in Chromium;
  preserved in `dist/parity-testing/tabs/before-activation-fix/`.
- Additional Linux/arm64 browser pass: **120 activation comparisons passed** against the built
  fixtures in `mcr.microsoft.com/playwright:v1.60.0-noble`, using one worker and the original timeout.
  Results are retained in `dist/tabs-g8-linux/results/`; the G8 macOS pass was the 273-row report.
- `PLAYWRIGHT_PORT=4411 pnpm exec playwright test -c apps/visual-regression/playwright.config.ts tabs.behavior.spec.ts agents.behavior.spec.ts --grep Tabs --project=chromium`
  — **3 passed** against a fresh Storybook build: the public Indicator's native CSS transition,
  whole-Panel keyframe lifecycle and projected wrapper.
- `pnpm exec playwright test -c apps/visual-regression/playwright.config.ts agents.behavior.spec.ts --grep 'Agents Tabs task' --project=chromium`
  — **1 passed**, against the existing locally served Storybook build. This verifies projected
  navigation/manual Enter/Space and forward list exit, not current shared-source rebuild equivalence.
- `pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts apps/radix-ssr-testing/src/ssr-rendering.spec.ts -t 'Tabs identities|renders <app-tabs>|emits hydration annotations|generates SSR-stable ids'`
  — **4 passed**, other SSR cases excluded. These prove server markup/metadata/native relationships, not actual
  client hydration or assistive-technology behavior.

The former “activates on Enter / Space” unit now tests composite Space. Separate units check native
Enter delegation; actual native keyboard defaults and callback order are established by G8's pinned
browser comparisons. Direction units use explicitly mocked coordinates; actual geometry/direction
is established by pinned browsers. Existing
story screenshots are settled visual evidence, not animation, focus or live Indicator measurements.

The separate [AppTabs consumer experiment](../../../tools/consumer-testing/generation/tabs/REPORT.md)
reports a frozen **34/36** result against an installed library snapshot, with two Chromium rapid
Enter/Tab failures. Its [follow-up](../../../tools/consumer-testing/generation/tabs/FOLLOWUPS.md)
records supplemental success after observing selection rendering. Neither result compares Base UI or
establishes ownership of that timing issue; do not relabel it as primitive parity or as 36/36.

Next increments: remaining gesture/composition scope and incremental/deferred hydration. G6's remaining continuous
inner-scroll/animation, realm and hydration combinations need separate evidence. G8's remaining scrolling/long-press, pen auxiliary-button and native OS/browser combinations stay explicit follow-ups.
Keep fixtures on actual native input and observable state; do not normalize away IDs, focus, mounting,
event metadata or geometry differences. Further Root disposal cases, nested/overlay consumers, hydration and
real-device/AT work remain explicit follow-ups.
