# Menu — Base UI compatibility

Audited 2026-11-10 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/menu).
This is incremental behavioral evidence, not complete API or accessibility certification.

| Contract                                                                        | Evidence                              | Status                                                          |
| ------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Enter/Space/Up/Down opening and pointer opening                                 | Pinned suite, three engines           | Covered; keyboard highlights an item, pointer focuses the popup |
| Roving focus, disabled focusable items, Home/End, loop/no-loop                  | Pinned suite                          | Covered                                                         |
| Typeahead, repeated prefix and explicit label                                   | Pinned suite                          | Covered                                                         |
| Enter/Space/click selection and closeOnClick=false                              | Pinned suite                          | Covered                                                         |
| Canceled open/close, checkbox and radio changes                                 | Pinned suite                          | Covered                                                         |
| Modal/non-modal outside press, Tab/Shift+Tab                                    | Pinned suite                          | Covered                                                         |
| Keyboard submenu entry, back/Escape, RTL and whole-chain selection              | Pinned suite                          | Covered                                                         |
| Generated/custom ARIA identities and changes between opens                      | Pinned suite                          | Covered                                                         |
| Native ID changes while open                                                    | Angular unit and Storybook regression | Additional Angular behavior; pin keys trigger identity by id    |
| Programmatic focus-out and WebKit pointer travel                                | Pinned suite                          | Exact known differences below                                   |
| Deferred/retained exits, CSS completion, cancellation, late holds and reopening | Pinned suite                          | Covered                                                         |
| Nested CSS exits and child completion                                           | Pinned suite                          | Covered with exact nested-exit-completion difference            |
| Hover grace areas and pointer drag/release                                      | Pinned suite, three engines           | Covered; exact WebKit coordinate-travel limits below            |
| Context Menu and Menubar composition                                            | Independent pinned suites             | Initial scope covered; see each family matrix                   |
| Dynamic insertion/removal/reordering, disabled state and labels                 | Pinned suite                          | Covered with removed-item-focus limits                          |
| Empty/refilled lists and removal/replacement of an open submenu owner           | Pinned suite                          | Four collection cases covered                                   |
| Real touch, devices and assistive technology                                    | Not established by this suite         | Pending                                                         |

The [runner](../../../apps/parity-testing/primitives/menu/README.md) defines 73 scenarios and
219 comparisons. Ordinary Menu and submenu fixtures use matching native buttons and uncontrolled
state. Checkbox/radio change requests are observed before cancellation; original event types and
trusted pointer coordinates are retained. No adapter forces focus, open state or completion.

Five collection scenarios insert/remove/reorder options and update disabled state or text while
open. Fixtures mutate application data through a native F3 shortcut; Angular uses `signal`/`@for`
and React uses state with stable keys. Highlight stays index-based, independently of DOM focus.
Restoring a surviving moved node does not rewrite that logical index. Both sets keep the primitive
state uncontrolled and record the actual native focus and item order. Four further cases cover
empty/refilled root and child lists, keyed child reordering and removal/replacement of an open
owning branch. The root's empty-list ArrowDown request retains index zero until data returns.
Removing a submenu and its trigger returns focus through the surviving DI owner chain. The common
focus manager ignores a disconnected default anchor; explicit final-focus policies remain authoritative.

## Known differences

- **programmatic-focus-out:** Angular closes when native focus moves to an unrelated input and
  preserves that input's focus. The pin leaves the menu open. Its FloatingFocusManager installs a
  portal capture focusout handler that sets `insideReactTree`; the queued close handler then consumes
  that marker and returns. Do not port this React portal workaround into Angular. Ten exact field
  pairs record this single policy difference at the `outside focused` checkpoint, including DOM,
  highlight and completion consequences. Native Tab/Shift+Tab have separate matching scenarios.
- **native-button-focus:** a canceled open on macOS WebKit leaves Angular focus on body, while the
  pin focuses its trigger. Angular follows native button click-focus preference; Base UI emits an
  explicit tabindex. Click promotion of a hover menu also exposes this native focus difference.
  Exact pairs are browser/platform scoped, as in Popover.
- **zero-delta-pointer-travel:** WebKit reports zero movement deltas for a trusted path whose viewport
  coordinates change. The pin's stateless guard drops that travel, while Angular highlights/focuses
  the target. Menu reuses core `createPointerMoveGuard`, already used by Select, with document capture
  per open menu. Actual stationary scroll events remain ignored. Exact pairs preserve the measured
  focus/highlight consequences through hover travel, press promotion and guarded releases, with
  raw pointer evidence in reports. Linux and macOS have separately reviewed scopes.

- **removed-item-focus:** in Firefox/WebKit the pin can leave focus on body after the focused
  option is removed without a native focusout. Angular observes actual DOM removal and restores the
  current tabbable item, so the next arrow still works. Exact focus/highlight consequences are scoped
  to the measured browsers/platforms; the fixture records the failed native keyboard continuation
  and then selects a surviving item with a real pointer click. It does not force reference focus.
- **nested-exit-completion:** with simultaneous parent/submenu CSS exits, Angular emits close
  completion for both roots. The pin omits the submenu's close completion when the parent removes
  its owning subtree and cleanup aborts the child's animation callback. Angular derives ancestor
  presence from actual child closing phases so the child can finish before its owning view is
  destroyed. One exact completion pair records this limitation; ordinary non-animated chain
  selection has matching callbacks. See [ADR 0035](../../../docs/adr/0035-menu-shared-close-lifecycle.md).

Exceptions are exact and fail if changed or disappeared. They do not establish complete parity.

## Migration

Arrow navigation opens/closes with `list-navigation`; item actions close with `item-press`.
Checkbox UI changes and radio UI changes also report `item-press` and retain the original native
event. Programmatic `RadioGroup.selectValue(value)` without an event retains `none`.
Selection closes ancestors before descendants, matching the pin's callback order.

Trigger, SubTrigger and Popup expose native `id` inputs with generated defaults. The owning Root
derives ARIA links from their reactive identity getters. A canceled Escape keeps item focus; Tab is
owned by native portal guards. Do not close synchronously in a keydown handler before Tab runs.
Roving tabindex is captured after Angular host bindings render, not before native buttons receive
their authored tabindex. See [ADR 0034](../../../docs/adr/0034-menu-differential-contracts.md).

Root now composes core `usePopupLifecycle`, already used by Select and Popover. Portal registers
actual Presence views, and Root exposes `unmount()` to finish a pending external exit. `close()`
defaults to `imperative-action`. Deferred completion waits for that action; repeated/stale actions
do not complete another close. Retained portals hide and stop tracking after completion. Context
Menu exposes the same actions through its composed Menu. Start external animations in
`onOpenChange`, not in the completion callback.

Positioner preserves its last placement during exit; a resource refresh must not reapply the
initial-placement animation guard. The animated story keeps Popup displayed for its actual CSS
exit and uses shared Tailwind utilities. Pending exits block pointer interaction without native
inert; native focus may remain in the popup. Closed items clear highlight and settled retained
popups remove their active ARIA label association. The suite compares retained checkbox state,
natural CSS timing, late/canceled holds and interrupted exits without forcing completion.

Hover opens with popup focus and no item highlight; a click promotes it to `trigger-press` without
closing or restarting the lifecycle. A press before the hover delay cancels that timer. Hover close
reports `trigger-hover` and its native mouse event, without returning trigger focus. Disabled items
can receive hover focus but cannot activate. Child Roots register through Angular DI; hovering a
parent item closes other branches through that existing registry. No DOM-wide query registry or
React interaction store is added.

The suite crosses root gaps and diagonal submenu grace polygons in LTR/RTL, checks canceled hover
and re-entry, then uses real down/move/up events for enabled, disabled, stay-open, checkbox and radio
commands. The 200ms release guard is observed without fake clocks. WebKit reports zero deltas while
trusted viewport coordinates change; exact focus/highlight pairs retain our coordinate guard. The
macOS click-promotion focus pairs also reflect native button focus behavior.

Next: entire-root removal, empty-list keyboard promotion, touch emulation and deeper composition in the independent
[Context Menu](../context-menu/PARITY.md) and [Menubar](../menubar/PARITY.md) suites.
Device/assistive-technology work remains open. See [ADR 0038](../../../docs/adr/0038-menu-collection-boundaries.md).
