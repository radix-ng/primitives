# Tabs — Base UI compatibility

Audited 2026-11-15 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
The prepared source digest was validated with `pnpm parity:prepare`.

This is a source/API audit with incremental comparison evidence, not full parity or accessibility
certification. The [Tabs differential suite](../../../apps/parity-testing/primitives/tabs/README.md)
now covers initial values and notifications: **11 scenarios, 33 comparisons** across Chromium,
Firefox and WebKit, with no skips or reviewed exceptions. G1 is resolved; remaining interaction,
identity, lifecycle and geometry gaps below are not certified by this initial-value increment.
**Pinned covered** means the stated subset passed direct Angular/Base UI comparison;
**Regression covered** below means an existing Angular check exercises the stated subset;
**source gap** means the implementations differ by inspection and need a focused comparison;
**pending** means the evidence does not establish the behavior. Documented Angular adaptations are
listed separately from unresolved gaps.

| Contract                                                                                 | Evidence                                                                       | Status                                                                                                     |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Root / List / Tab / Panel / Indicator part set                                           | Public barrels and all five pinned parts                                       | Present; Angular directives and `hostDirectives` composition                                               |
| `value`, `defaultValue`, horizontal default orientation                                  | Pinned initial-value suite; null/default units; orientation source             | Pinned covered for numeric/string defaults and controlled `null`; G1 resolved                              |
| Implicit value `0`, initial notification and disabled-first fallback                     | Pinned initial-value suite; three implicit-default units                       | Pinned covered, including a later value-0 tab, missing `0`, all disabled and uncancelable initial fallback |
| Explicit disabled default and later disable/re-enable                                    | Pinned initial-value suite; Root honor policy                                  | Initial disabled default pinned covered; later lifecycle combinations pending                              |
| Selected uncontrolled tab becomes disabled                                               | Implicit-default unit                                                          | Regression covered; first enabled value, reason `disabled`, direction `none`                               |
| Missing selected tab, empty/refilled/replaced lists, all disabled                        | Pinned all-disabled initial case; Root source                                  | Initial all-disabled case covered; later collection changes pending, G2                                    |
| Controlled initial/external values; parent ignores a request                             | Angular `model` and ownership-detection source; selected-disabled unit         | Adapted ownership; request rejection and external direction pending, G3                                    |
| Click selection, same-value no-op and cancel before commit                               | Click and cancellation units; Tab/Root guards                                  | Regression covered for click/cancel; duplicate native callbacks pending                                    |
| Event reasons, native event, trigger and callback order                                  | Root source; reason/direction assertions                                       | Reasons partially covered; event metadata differs on keyboard paths, G8                                    |
| Manual activation by default; automatic activation on focus                              | Focus and arrow-navigation units                                               | Regression covered for horizontal navigation                                                               |
| Home/End, looping and `loopFocus=false`                                                  | Units; projected-wrapper browser scenario                                      | Regression covered for Home/End and one non-loop boundary; default wrap pending                            |
| Vertical Up/Down, horizontal RTL and modifier keys                                       | Shared Composite source; orientation-attribute unit                            | Tabs-specific browser comparisons pending                                                                  |
| Disabled tabs remain arrow-focusable without activation                                  | Unit verifies native disabled is absent, ARIA state, focus and unchanged value | Regression covered for horizontal arrows/click; native pointer/keyboard combinations pending               |
| Disabled controlled selection preserves an enabled Tab entry                             | Selected-disabled unit; List source                                            | Regression covered with focus outside the list; dynamic focus cases pending                                |
| Native Tab / Shift+Tab into list, panel and adjacent controls                            | Projected-wrapper browser test checks forward exit from the list               | Partial; exact panel destination, reverse order and rapid Enter/Tab pending                                |
| `role`, `aria-selected`, orientation and reciprocal IDs                                  | Roles/identity units; SSR ID check                                             | Regression covered for default IDs; mounted/custom identities differ, G5                                   |
| Per-part `data-orientation`, `data-activation-direction`, Tab active/disabled attributes | Host bindings vs pinned DataAttributes files; selected-state units             | Names present; direction updates differ, G3                                                                |
| Panel indexes and active/inactive tabindex                                               | Composite-index unit; Panel source                                             | Index regression covered; tabindex source only                                                             |
| Panel unmount / `keepMounted`                                                            | Three presence units; documented two-directive pattern                         | Adapted: persistent panel host, opt-in content removal; G4                                                 |
| Panel enter/exit attributes, hidden timing, inert contents and interrupted transitions   | Panel/transition source; Animated/KeyframeUnmount stories                      | Source gap for inert/hidden semantics, G4; animation lifecycle not browser-proven                          |
| Indicator six `--active-tab-*` variables and common state attributes                     | Indicator source vs pinned CssVars/DataAttributes files; Indicator story       | Names present; geometry behavior differs, G6; no Indicator unit/browser assertions                         |
| Indicator custom tab ID, absent/zero-size selection, resize and List replacement         | Indicator lookup/observer source vs pinned Tab/List/Indicator                  | Source gaps, G6                                                                                            |
| Indicator scroll, borders, scale/transforms and intermediate scroll containers           | Geometry calculations vs pinned Indicator and browser tests                    | Source gaps, G6; screenshots do not prove live geometry                                                    |
| Tab/Panel value domain and unique identity                                               | Public value types and ID builders                                             | Narrower API and collision risk, G7                                                                        |
| Custom/native hosts, keyboard activation and disabled links                              | `nativeButton` and event-handler source vs pinned `useButton`                  | Source gaps, G8; no Tabs custom-host regression                                                            |
| Projected parts through a host-composed Root                                             | Five wrapper units and one Chromium Storybook scenario                         | Regression covered; Root must stay in the declaring injector tree                                          |
| List destruction/recreation and stale registration cleanup                               | Two wrapper lifecycle units                                                    | Regression covered for retained string selection; whole-Root cleanup pending                               |
| Nested Roots, multiple instances and use inside Dialog/Popover                           | Source/context review; separate consumer experiment                            | Pending direct comparisons; consumer experiment is not parity evidence                                     |
| SSR rendering, hydration metadata and ID shape                                           | Three selected SSR checks                                                      | Regression covered; actual client hydration and Indicator first paint pending                              |
| Indicator `renderBeforeHydration` / server-visible positioning                           | Pinned Indicator prop and prehydration source; no Angular counterpart          | Missing capability; equivalent first-paint behavior not established                                        |
| Real touch/pen, devices, assistive technology and axe                                    | Not exercised by the checks run here                                           | Pending                                                                                                    |

## Documented Angular adaptations

- All five parts attach to consumer-owned hosts. React `render`, ref and state-dependent
  `className`/`style` callbacks are replaced by Angular composition, native bindings and exported
  directives; a React store or ref implementation is not a requirement. See
  [framework adaptation](../../../docs/engineering/mechanisms/framework-adaptation-during-parity-work.md).
- Panel hosts stay mounted. `*rdxTabsPanelPresence` removes their contents and `keepMounted` retains
  those contents. This existing two-directive pattern is documented in the
  [Tabs family note](../../../docs/engineering/families/tabs-follow-the-base-ui-part-set.md),
  [public MDX](stories/tabs.docs.mdx) and [ADR 0010](../../../docs/adr/0010-structural-portal-presence.md).
  It does not establish equivalent exit focusability or ARIA registration; those remain G4/G5.
- Projected tabs resolve the inner List through the Root's Composite owner bridge. The Root must be
  on the wrapper host, in the projected parts' declaring injector tree. This follows
  [ADR 0001](../../../docs/adr/0001-angular-composite-navigation-layer.md).
- `onValueChange` emits `{ value, eventDetails }`, and `value` is an Angular model with a generated
  `valueChange` output. Consumers veto a request with `eventDetails.cancel()` before the model commits.
  React callback arity and controlled-prop mechanics are not copied, but observable state ownership
  still needs the comparisons in G2/G3.

## Source gaps and required comparisons

G1 was reproduced and fixed through direct comparison. The remaining findings are not reviewed
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

### G3 — External selection does not recompute activation direction

Angular writes `activationDirection` only in `setValue` and automatic fallback. An application write
to the `value` model changes selection without recomputing direction; clearing/restoring selection can
retain an old direction. The pin computes direction for externally supplied values, including adding
and selecting a tab in one update. Angular also falls back to DOM index when registered tabs have
equal axis coordinates, whereas the pin returns `none`.

Compare external changes on both axes and in RTL, cancellation followed by an external change,
null/restore, equal-position tabs, and same-update insertion with values out of DOM order. Record
direction on every part and on change details. Also compare external selection while focus is inside
versus outside the List, and a parent ignoring a request: Angular's model commits accepted requests
locally, while its `externallyControlled` detection is inferred from observed value writes.

### G4 — Exiting Panel contents are not inert; hidden state changes earlier

[Panel](src/tabs-panel.ts) uses `data-hidden` as `!active` and keeps its host visible while ending;
it never binds `inert`. The
[pinned Panel](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs/panel/TabsPanel.tsx)
makes inactive contents inert immediately and derives `data-hidden` from transition mounting, so it
remains absent during exit. In Angular, an outgoing visible panel can retain interactive descendants.
With presence and `keepMounted=false`, the empty inactive host also stops forcing `hidden`.

Compare actual Tab/Shift+Tab, pointer and programmatic focus during paused/natural exits, with and
without presence/keepMounted, rapid reselection and nested animations. Observe the retained host,
contents, inertness and all transition attributes separately; persistent hosts alone are the documented
adaptation, not evidence for equivalent interactivity.

### G5 — Identity follows derived values instead of mounted Panel registration

[Tab](src/tabs-tab.ts) always derives `aria-controls` from the root ID and value. Panel similarly
derives its own ID and falls back to a derived tab label ID. The pin registers actual mounted Panel
IDs, removes controls when the target unmounts, resolves labels from registered tabs and protects a
replacement registration from stale cleanup. Angular has no mounted-panel registry or Panel ID input.

Compare absent/removed panels and tabs, custom native Panel IDs, custom/dynamically changed Tab IDs,
retained panels and same-value Panel replacement. A custom Tab ID already reaches Panel labels through
`tabMap`; that path must remain distinct from Indicator's broken lookup in G6. The persistent-host
adaptation can explain a mounted inactive target, but cannot explain an IDREF to an absent target.

### G6 — Indicator lookup, visibility, measurement and observation are incomplete

[Indicator](src/tabs-indicator.ts) looks up a generated ID with global `document.getElementById`,
ignoring registered custom Tab IDs and owner-document/shadow-root context. It publishes variables
without the pin's `role=presentation` or hiding/omitting the indicator for an absent or zero-size
selection. It observes only the initial List, not each tab, and its measurement effect does not depend
on `tabMap`. A tab can change size/position inside a fixed-size List without a new measurement;
replacing the List does not reconnect its ResizeObserver.

The [pinned Indicator](https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/tabs/indicator/TabsIndicator.tsx)
uses registered elements, shared List/tab resize observation, CSS dimensions and layout/rect offsets
that account for borders, scale and transforms. Angular uses viewport rect dimensions/deltas plus the
List scroll offsets for left/top; right/bottom remain viewport-edge relative instead of content-edge
relative. Compare all six variables in a real browser for custom IDs, null/missing/hidden tabs, dynamic
labels/insertion, resize, List replacement, overflow on both axes, borders, scaled/rotated/flipped
ancestors, translated tabs and intermediate scrollers. Include multiple indicators and cleanup.

### G7 — Value domain and generated IDs are narrower than the pin

[Public types and ID builders](src/utils.ts) accept `string | number | null`; the pin accepts arbitrary
identity values, including object/function values. Angular stringifies values into IDs, so numeric `1`
and string `'1'` remain distinct selections but produce duplicate Tab/Panel IDs within the same Root.
Decide and document the supported value domain; compare mixed-type IDs before calling identity parity
complete. Arbitrary-value support is an API capability gap, not a request to copy React state handling.

### G8 — Keyboard/native-host activation does not use the pin's button contract

[Tab](src/tabs-tab.ts) commits Enter/Space directly on `keydown`, without preventing the native
Space default, guarding `event.target === event.currentTarget`, or preventing disabled link navigation.
`nativeButton=false` currently changes the `type` attribute only. The pin routes activation through
`useButton`, prevents composite Space defaults, synthesizes/native-dispatches clicks as appropriate
and prevents disabled activation defaults. Consequently callback event type/order, native navigation
and duplicate attempts after a canceled key request need comparison even when the final value agrees.

Test button/div/anchor hosts, native Enter/Space and repeat, modifier/link navigation, disabled links,
bubbled descendant keys, canceled requests and original event/trigger details. Include held secondary
pointer focus followed by pointerup/pointercancel, touch and removal during a press; source guards alone
do not establish trusted-event behavior or listener cleanup.

## Verification and limits

Checks run for this audit on Node 24.22.2:

- `pnpm parity:prepare` — Base UI 1.9.0 pin and cached content digest validated.
- `pnpm exec vitest run --config packages/primitives/vite.config.ts packages/primitives/tabs/__tests__`
  — **34 passed**, including two null-default regressions that failed before the fix.
- `pnpm test-parity tabs` — **33 passed** (11 initial-value scenarios × three engines), strict fixture
  compilation/build and the shared runner's 13 infrastructure tests passed. The initial Chromium run
  before the runtime fix passed nine cases and failed both null-default cases; its reports/traces are
  retained locally in `dist/parity-testing/tabs/before-null-fix/`.
- `pnpm exec playwright test -c apps/visual-regression/playwright.config.ts agents.behavior.spec.ts --grep 'Agents Tabs task' --project=chromium`
  — **1 passed**, against the existing locally served Storybook build. This verifies projected
  navigation/manual Enter/Space and forward list exit, not current shared-source rebuild equivalence.
- `pnpm exec vitest run --config apps/radix-ssr-testing/vite.config.ts apps/radix-ssr-testing/src/ssr-rendering.spec.ts -t 'renders <app-tabs>|emits hydration annotations|generates SSR-stable ids'`
  — **3 passed**, other SSR cases excluded. These prove server markup/metadata/ID shape, not actual
  client hydration or assistive-technology behavior.

The unit named “activates on Enter / Space” dispatches only Enter. Space is exercised by the wrapper
browser scenario, but native keyboard event metadata and cancellation are not. Direction units run
without layout and observe Angular's index fallback; they cannot prove geometry parity. Existing
story screenshots are settled visual evidence, not animation, focus or live Indicator measurements.

The separate [AppTabs consumer experiment](../../../tools/consumer-testing/generation/tabs/REPORT.md)
reports a frozen **34/36** result against an installed library snapshot, with two Chromium rapid
Enter/Tab failures. Its [follow-up](../../../tools/consumer-testing/generation/tabs/FOLLOWUPS.md)
records supplemental success after observing selection rendering. Neither result compares Base UI or
establishes ownership of that timing issue; do not relabel it as primitive parity or as 36/36.

Next increments: inert/animated-panel focus for G4, external selection/direction for G3, mounted ARIA
identities and native activation for G5/G8, followed by Indicator geometry/observation for G6. Dynamic
collection and value-domain work remain G2/G7.
Keep fixtures on actual native input and observable state; do not normalize away IDs, focus, mounting,
event metadata or geometry differences. Whole-Root removal, nested/overlay consumers, hydration and
real-device/AT work remain explicit follow-ups.
