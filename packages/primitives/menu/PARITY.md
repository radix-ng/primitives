# Menu — Base UI compatibility

Audited 2026-11-10 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/menu).
This is incremental behavioral evidence, not complete API or accessibility certification.

| Contract                                                                         | Evidence                              | Status                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Enter/Space/Up/Down opening and pointer opening                                  | Pinned suite, three engines           | Covered; keyboard highlights an item, pointer focuses the popup |
| Roving focus, disabled focusable items, Home/End, loop/no-loop                   | Pinned suite                          | Covered                                                         |
| Typeahead, repeated prefix and explicit label                                    | Pinned suite                          | Covered                                                         |
| Enter/Space/click selection and closeOnClick=false                               | Pinned suite                          | Covered                                                         |
| Canceled open/close, checkbox and radio changes                                  | Pinned suite                          | Covered                                                         |
| Modal/non-modal outside press, Tab/Shift+Tab                                     | Pinned suite                          | Covered                                                         |
| Keyboard submenu entry, back/Escape, RTL and whole-chain selection               | Pinned suite                          | Covered                                                         |
| Generated/custom ARIA identities and changes between opens                       | Pinned suite                          | Covered                                                         |
| Native ID changes while open                                                     | Angular unit and Storybook regression | Additional Angular behavior; pin keys trigger identity by id    |
| Programmatic focus-out and WebKit pointer travel                                 | Pinned suite                          | Exact known differences below                                   |
| Deferred/retained lifecycle, CSS timing, hover grace areas, pointer drag/release | Existing Angular regressions vary     | Pinned comparisons pending                                      |
| Context Menu and Menubar composition                                             | Existing Angular regressions          | Independent pinned comparisons pending                          |
| Dynamic collections, real touch, devices and assistive technology                | Not established by this suite         | Pending                                                         |

The [runner](../../../apps/parity-testing/primitives/menu/README.md) defines 34 scenarios and
102 comparisons. Ordinary Menu and submenu fixtures use matching native buttons and uncontrolled
state. Checkbox/radio change requests are observed before cancellation; original event types and
trusted pointer coordinates are retained. No adapter forces focus, open state or completion.

## Known differences

- **programmatic-focus-out:** Angular closes when native focus moves to an unrelated input and
  preserves that input's focus. The pin leaves the menu open. Its FloatingFocusManager installs a
  portal capture focusout handler that sets `insideReactTree`; the queued close handler then consumes
  that marker and returns. Do not port this React portal workaround into Angular. Ten exact field
  pairs record this single policy difference at the `outside focused` checkpoint, including DOM,
  highlight and completion consequences. Native Tab/Shift+Tab have separate matching scenarios.
- **native-button-focus:** a canceled open on macOS WebKit leaves Angular focus on body, while the
  pin focuses its trigger. Angular follows native button click-focus preference; Base UI emits an
  explicit tabindex. The exact pair is browser/platform scoped, as in Popover.
- **zero-delta-pointer-travel:** WebKit reports zero movement deltas for a trusted path whose viewport
  coordinates change. The pin's stateless guard drops that travel, while Angular highlights/focuses
  the target. Menu reuses core `createPointerMoveGuard`, already used by Select, with document capture
  per open menu. Actual stationary scroll events remain ignored. The two exact pairs preserve the
  measured focus/highlight difference, with raw pointer evidence in reports.

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

Positioner preserves its last placement during exit; a resource refresh must not reapply the
initial-placement animation guard. The animated story keeps Popup displayed for its actual CSS
exit and uses shared Tailwind utilities. Angular browser regressions cover this recipe; pinned
animation/lifetime comparisons remain pending.

Next: migrate Menu's existing hold/transition mechanism to the shared popup lifecycle, then compare
retained/deferred exits and extend hover/pointer and Context Menu/Menubar scenarios.
