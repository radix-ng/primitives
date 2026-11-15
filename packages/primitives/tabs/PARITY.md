# Tabs — Base UI compatibility

Audited 2026-11-15 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
The prepared source digest was validated with `pnpm parity:prepare`.

This is a source/API audit with incremental comparison evidence, not full parity or accessibility
certification. The [Tabs differential suite](../../../apps/parity-testing/primitives/tabs/README.md)
now covers initial values/notifications, Panel exits/focus, activation direction, identities and native activation:
**91 scenarios, 273 comparisons** across Chromium, Firefox and WebKit, with no skips. Six exact reviewed
fields cover the custom-Panel ID and persistent-host differences in G5. G1 and G3's direction defects
are resolved; G4's inert/hidden defects and G5's identity defects are resolved for their documented
scope. G8's native keyboard/click/press-release subset is resolved; remaining interaction, lifecycle
and geometry gaps below are not certified by these increments.
**Pinned covered** means the stated subset passed direct Angular/Base UI comparison;
**Regression covered** below means an existing Angular check exercises the stated subset;
**source gap** means the implementations differ by inspection and need a focused comparison;
**pending** means the evidence does not establish the behavior. Documented Angular adaptations are
listed separately from unresolved gaps.

| Contract                                                                                 | Evidence                                                                            | Status                                                                                                          |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Root / List / Tab / Panel / Indicator part set                                           | Public barrels and all five pinned parts                                            | Present; Angular directives and `hostDirectives` composition                                                    |
| `value`, `defaultValue`, horizontal default orientation                                  | Pinned initial-value suite; null/default units; orientation source                  | Pinned covered for numeric/string defaults and controlled `null`; G1 resolved                                   |
| Implicit value `0`, initial notification and disabled-first fallback                     | Pinned initial-value suite; three implicit-default units                            | Pinned covered, including a later value-0 tab, missing `0`, all disabled and uncancelable initial fallback      |
| Explicit disabled default and later disable/re-enable                                    | Pinned initial-value suite; Root honor policy                                       | Initial disabled default pinned covered; later lifecycle combinations pending                                   |
| Selected uncontrolled tab becomes disabled                                               | Implicit-default unit                                                               | Regression covered; first enabled value, reason `disabled`, direction `none`                                    |
| Missing selected tab, empty/refilled/replaced lists, all disabled                        | Pinned all-disabled initial case; Root source                                       | Initial all-disabled case covered; later collection changes pending, G2                                         |
| Controlled initial/external values; parent ignores a request                             | Pinned direction suite; selected-disabled unit; native model source                 | External direction/focus and explicit cancellation covered, G3; ignoring-parent equivalence not established     |
| Click selection, same-value no-op and cancel before commit                               | Forty pinned activation cases; eight activation units                               | Pinned covered for native requests, canceled retry, repeat and same-value no-op                                 |
| Event reasons, native event, trigger and callback order                                  | Pinned capture/bubble/change timeline, native event metadata and raw trigger data   | Type/trust/target/modifiers/order covered; optional Angular trigger retained, ADR 0075                          |
| Manual activation by default; automatic activation on focus                              | Focus and arrow-navigation units                                                    | Regression covered for horizontal navigation                                                                    |
| Home/End, looping and `loopFocus=false`                                                  | Units; projected-wrapper browser scenario                                           | Regression covered for Home/End and one non-loop boundary; default wrap pending                                 |
| Vertical Up/Down, horizontal RTL and modifier keys                                       | Shared Composite source; orientation-attribute unit                                 | Tabs-specific browser comparisons pending                                                                       |
| Disabled tabs remain arrow-focusable without activation                                  | Pinned disabled button/div/link key/click cases; state and focus units              | Covered for disabled native defaults/navigation and horizontal entry; touch/pen remain pending                  |
| Disabled controlled selection preserves an enabled Tab entry                             | Selected-disabled unit; List source                                                 | Regression covered with focus outside the list; dynamic focus cases pending                                     |
| Native Tab / Shift+Tab into list, panel and adjacent controls                            | Pinned held-exit cases and projected-wrapper browser test                           | Forward/reverse active-panel order covered during exits; rapid pre-render Enter/Tab remains pending             |
| `role`, `aria-selected`, orientation and reciprocal IDs                                  | Fifteen pinned identity cases, seven identity units and native SSR relationships    | G5 covered for registered/authored identities; two documented adaptations                                       |
| Per-part `data-orientation`, `data-activation-direction`, Tab active/disabled attributes | Pinned direction suite, first sampled frame, host bindings and selected-state units | G3 direction covered on Root/List/Tab/Panel and non-null Indicator; live orientation/style combinations pending |
| Panel indexes and active/inactive tabindex                                               | Composite-index unit; pinned Panel snapshots                                        | Index regression covered; active/inactive tabindex pinned covered in lifecycle cases                            |
| Panel unmount / `keepMounted`                                                            | Three presence units; pinned exit/reselection cases                                 | Content lifetime covered with persistent-host adaptation, G4; raw DOM retains host presence                     |
| Panel enter/exit attributes, hidden timing, inert contents and interrupted transitions   | Eight pinned cases and public keyframe browser regression                           | G4 fixed for documented retained/structural exits; deeper lifecycle follow-ups remain                           |
| Indicator six `--active-tab-*` variables and common state attributes                     | Pinned custom-ID width case; source vs pinned CssVars/DataAttributes                | Registered lookup/width covered; remaining geometry and visibility differ, G6                                   |
| Indicator custom tab ID, absent/zero-size selection, resize and List replacement         | Pinned custom-ID case and Indicator lookup/observer source                          | Custom/default ID lookup fixed in G5; visibility and observation remain G6                                      |
| Indicator scroll, borders, scale/transforms and intermediate scroll containers           | Geometry calculations vs pinned Indicator and browser tests                         | Source gaps, G6; screenshots do not prove live geometry                                                         |
| Tab/Panel value domain and unique identity                                               | Public value types; pinned mixed numeric/string identities                          | ID collisions fixed in G5; arbitrary-value API remains G7                                                       |
| Custom/native hosts, keyboard activation and disabled links                              | Forty native activation cases on button/div/link/anchor hosts                       | G8 covered for the documented keyboard/click/secondary-release subset                                           |
| Projected parts through a host-composed Root                                             | Five wrapper units and one Chromium Storybook scenario                              | Regression covered; Root must stay in the declaring injector tree                                               |
| List destruction/recreation and stale registration cleanup                               | Two wrapper lifecycle units                                                         | Regression covered for retained string selection; whole-Root cleanup pending                                    |
| Nested Roots, multiple instances and use inside Dialog/Popover                           | Pinned independent-Root identities; separate consumer experiment                    | Independent identities covered; nested/overlay consumers pending                                                |
| SSR rendering, hydration metadata and native ID relationships                            | Four selected SSR checks                                                            | Regression covered; actual client hydration and Indicator first paint pending                                   |
| Indicator `renderBeforeHydration` / server-visible positioning                           | Pinned Indicator prop and prehydration source; no Angular counterpart               | Missing capability; equivalent first-paint behavior not established                                             |
| Real touch/pen, devices, assistive technology and axe                                    | Not exercised by the checks run here                                                | Pending                                                                                                         |

## Documented Angular adaptations

- All five parts attach to consumer-owned hosts. React `render`, ref and state-dependent
  `className`/`style` callbacks are replaced by Angular composition, native bindings and exported
  directives; a React store or ref implementation is not a requirement. See
  [framework adaptation](../../../docs/engineering/mechanisms/framework-adaptation-during-parity-work.md).
- Panel hosts stay mounted. `*rdxTabsPanelPresence` removes their contents and `keepMounted` retains
  those contents. This existing two-directive pattern is documented in the
  [Tabs family note](../../../docs/engineering/families/tabs-follow-the-base-ui-part-set.md),
  [public MDX](stories/tabs.docs.mdx) and [ADR 0010](../../../docs/adr/0010-structural-portal-presence.md).
  G4 compares exit focusability and content lifetime; G5 explicitly compares native ARIA targets and
  records the persistent-host difference in [ADR 0074](../../../docs/adr/0074-tabs-native-identities.md).
- Projected tabs resolve the inner List through the Root's Composite owner bridge. The Root must be
  on the wrapper host, in the projected parts' declaring injector tree. This follows
  [ADR 0001](../../../docs/adr/0001-angular-composite-navigation-layer.md).
- `onValueChange` emits `{ value, eventDetails }`, and `value` is an Angular model with a generated
  `valueChange` output. Consumers veto a request with `eventDetails.cancel()` before the model commits.
  React callback arity and controlled-prop mechanics are not copied, but observable state ownership
  retains the G2 collection follow-ups; G3 compares accepted and explicitly canceled requests, not an
  ignoring parent's React controlled-prop semantics.
- Change details retain Angular's optional initiating native `trigger`; pinned Tabs leaves it unset.
  G8 asserts each policy and retains it in raw measurements. Equal trigger availability is outside
  the native callback equivalence. See [ADR 0075](../../../docs/adr/0075-tabs-native-activation.md).

## Source gaps and required comparisons

G1, G3's direction defects, G4, G5 and G8's native-activation subset were reproduced and fixed through direct comparison. G5 has
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

### G2 — Empty or replaced Lists can retain stale selection metadata

[Root registration cleanup](src/tabs-root.ts) intentionally retains `tabMap` while a List is absent.
Its empty-map fallback checks the connection of the last tab, but requires the map itself to become
empty. The existing unit proves selection survives destruction/recreation of the List; it does not
prove actual empty-list fallback. The pin distinguishes disconnected removal from connected temporary
cleanup. Compare removing the selected tab, removing the last tab, replacing a populated List with an
empty List, delayed/refilled Lists and all-disabled collections. Observe `missing`/`null`, DOM focus,
roving tabindex and callbacks without adapters repairing state.

### G3 — Resolved for direction: external values, geometry and pending destinations

[Root](src/tabs-root.ts) now derives activation direction from its model with `linkedSignal` and
publishes a readonly computed direction to the parts. Render hooks collect physical layout; a new
destination retains the committed origin until its geometry is available, then corrects the value
fallback. Equal coordinates return `none`, and automatic consistency updates explicitly reset the
direction. Accepted requests retain their event's live geometry; cancellation leaves the origin alone.
Direction is published before the model commit, including fallback, so synchronous model subscribers
observe consistent state.

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

Parent rejection through explicit `cancel()` is compared. An ignoring parent's controlled-prop
semantics remain outside the Angular model contract exercised here; accepted Angular requests commit
locally. Live axis/style changes in the same selection update, transition-frame transforms and
Indicator lifetime/geometry are not certified by this increment. G2 collection ownership remains open.

### G4 — Resolved for retained/structural exits: inert contents and hidden timing

[Panel](src/tabs-panel.ts) now binds `inert` whenever inactive, removes it on selection and applies
`data-hidden` after actual exit completion. The empty persistent host becomes hidden after structural
contents exit as well. [TabsPanelPresence](src/tabs-panel-presence.ts) adapts the shared
`PresenceMachine` to watch the Panel host and descendants, rather than only its embedded template's
roots. Panel derives its ending phase from actual mounted structural contents alongside its host
transition; it does not maintain an independent content-removal timer.

Eight pinned cases cover immediate/paused/natural exits, structural presence on/off, retained
contents, rapid reselection, actual forward/backward Tab order, rejected focus requests and trusted
pointer activation. In the nested case, finishing the child first leaves the host exit pending.
Before the fix, seven of eight Chromium cases failed; all 24 new comparisons now pass across three
engines without exceptions. A unit checks inactive inertness and a separate public-story browser test
checks nested-content-only keyframes, empty-host hiding and reuse.

The [pinned Panel](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs/panel/TabsPanel.tsx)
waits on its own element's motion. Angular's pre-existing descendant-only exit support is a documented
capability, not a claim that the pin has the same wait policy. Raw DOM retains the persistent-empty
host versus unmounted-host distinction. Later-finishing/replaced descendant motion, whole-Root removal
and live keepMounted/presence changes remain follow-ups; native ARIA identity is compared in G5.

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

[ADR 0074](../../../docs/adr/0074-tabs-native-identities.md) accepts six exact exception fields for
two intentional differences: Angular registers an authored Panel's actual ID where the pin leaves a
dangling generated-ID reference, and Angular retains a valid persistent native Panel target when
structural contents are removed. Neither difference suppresses labels, selection, notifications or
other scenarios. Imperative DOM-ID mutation, cross-root moves and actual hydration remain follow-ups.

### G6 — Indicator lookup, visibility, measurement and observation are incomplete

[Indicator](src/tabs-indicator.ts) now uses the registered Tab element and its measurement effect
depends on `tabMap`; the G5 custom-ID case verifies width before/after an ID edit. It still publishes
variables without the pin's `role=presentation` or hiding/omitting the indicator for an absent or
zero-size selection. It observes only the initial List, not each tab. A tab can change size/position
inside a fixed-size List without a new measurement; replacing the List does not reconnect its
ResizeObserver. Owner-document/shadow-root combinations have not been compared.

The [pinned Indicator](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs/indicator/TabsIndicator.tsx)
uses registered elements, shared List/tab resize observation, CSS dimensions and layout/rect offsets
that account for borders, scale and transforms. Angular uses viewport rect dimensions/deltas plus the
List scroll offsets for left/top; right/bottom remain viewport-edge relative instead of content-edge
relative. Compare all six variables in a real browser for custom IDs, null/missing/hidden tabs, dynamic
labels/insertion, resize, List replacement, overflow on both axes, borders, scaled/rotated/flipped
ancestors, translated tabs and intermediate scrollers. Include multiple indicators and cleanup.

### G7 — Value domain remains narrower than the pin

[Public types](src/utils.ts) accept `string | number | null`; the pin accepts arbitrary identity
values, including object/function values. G5 removes value stringification from generated IDs and
compares distinct numeric `1`/string `'1'` selection with unique native identities. Arbitrary-value
support remains an API capability gap, not a request to copy React state handling.

### G8 — Resolved for native keyboard/click activation and secondary release

[Tab](src/tabs-tab.ts) now requests selection from click or automatic focus. Native button/link Enter
belongs to the browser; custom-host Enter and composite Space dispatch clicks through the owned core
utility, preserving modifiers. Space prevents scrolling and its native button keyup default, so a
canceled request cannot be retried in the same physical press. Descendant activation keys keep their
own defaults. Disabled tabs suppress defaults without native disabling, including link navigation.
Automatic activation uses actual focusin; pending press listeners release together on up/cancel/destroy.

Forty cases compare button/div/link/anchor hosts, Enter/Space/repeat, canceled/accepted physical
requests, selected-tab no-ops, modifiers, prevented Enter, disabled key/click defaults, descendant
keys, form non-submission and held right/middle presses followed by native arrow focus. Capture/
bubble/change order, native event type/trust/target/modifiers, selection, tabindex, focus, hash and
scrolling are compared. Before the fix **40/40** Chromium cases failed with zero reference assertion
failures. Eight new units failed before the fix, including paired listener disposal.

[ADR 0075](../../../docs/adr/0075-tabs-native-activation.md) preserves Angular's optional initiating
native trigger. Its actual value is retained in raw measurements and asserted independently of the
reference's unset property; equal trigger availability is not certified. The 120 activation comparisons
add no differential exception. Native pointer cancellation/removal mid-press, touch/pen, auxiliary
link activation, authored submit/reset types and browser shortcuts remain follow-ups.

## Verification and limits

Checks run for this audit on Node 24.22.2:

- `pnpm parity:prepare` — Base UI 1.9.0 pin and cached content digest validated.
- `pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/tabs/__tests__`
  — **54 passed**, including eight native-activation regressions, seven native-identity regressions, null-default, Panel inertness, direction
  regressions and synchronous model/direction publication.
- `pnpm test-parity tabs` — **273 passed** (91 initial-value/Panel/direction/identity/activation scenarios × three engines), strict fixture
  compilation/build and the shared runner's 13 infrastructure tests passed. The initial Chromium run
  before the runtime fix passed nine cases and failed both null-default cases; its reports/traces are
  retained locally in `dist/parity-testing/tabs/before-null-fix/`.
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
  Results are retained in `dist/tabs-g8-linux/results/`; the full macOS pass remains the 273-row report.
- `PLAYWRIGHT_PORT=4411 pnpm exec playwright test -c apps/visual-regression/playwright.config.ts tabs.behavior.spec.ts agents.behavior.spec.ts --grep Tabs --project=chromium`
  — **2 passed** against a fresh Storybook build: public keyframe lifecycle and projected wrapper.
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

Next increments: Indicator geometry/observation for G6, then dynamic collection/value-domain work
for G2/G7. G8's remaining native gesture and auxiliary-host combinations stay explicit follow-ups.
Keep fixtures on actual native input and observable state; do not normalize away IDs, focus, mounting,
event metadata or geometry differences. Whole-Root removal, nested/overlay consumers, hydration and
real-device/AT work remain explicit follow-ups.
