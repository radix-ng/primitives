# Menubar — Base UI compatibility

Audited 2026-11-10 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/menubar).
This is incremental evidence, not complete API or accessibility certification.

| Contract                                                              | Evidence                                | Status                                         |
| --------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------- |
| Keyboard and native mouse-down opening                                | Independent pinned suite, three engines | Covered                                        |
| Closed roving, Home/End and disabled-trigger skipping                 | Pinned suite                            | Covered                                        |
| Keyboard/pointer sibling switching and RTL                            | Pinned suite                            | Covered                                        |
| Whole-bar disabling                                                   | Pinned suite                            | Covered                                        |
| Selection, cancellation, outside dismissal and Tab                    | Pinned suite                            | Covered for initial requests                   |
| Reason, native event, callback order and focus ownership              | Pinned suite                            | Covered in the cases above                     |
| Dynamic insertion/removal/reordering, labels and unfocused disabling  | Pinned suite                            | Covered                                        |
| Current-trigger disabling, backward LTR/RTL and single-menu switching | Pinned suite                            | Covered with exact pin limitations below       |
| Vertical bar opening/roving, popup navigation and Escape              | Pinned suite                            | Covered for vertical popup lists               |
| Vertical return arrow, LTR/RTL                                        | Pinned suite                            | Covered; native trigger-focus reopen           |
| Nested keyboard/pointer switching and composed popup hosts            | Pinned suite                            | Covered with child-completion limitation       |
| Canceled sibling open/close and retry                                 | Pinned suite                            | Covered, including interaction mode            |
| Child opening/closing cancellation and retry                          | Pinned suite                            | Keyboard open, Escape and return arrow covered |
| Default and externally bound open state                               | Angular unit checks                     | Regression; differential cases pending         |
| Touch, real devices and assistive technology                          | Not established                         | Pending                                        |

The [runner](../../../apps/parity-testing/primitives/menubar/README.md) defines 42 scenarios and
126 comparisons. Sixteen exact pairs document four reviewed differences below.

Five dynamic cases insert/remove/reorder top-level menus and change an unfocused trigger's
`disabled` state or a label. Roving tabindex follows the actual focused trigger as DOM order changes;
focus lost while Angular moves a surviving keyed node is repaired through the shared DOM observer.
Removing a closed focused trigger follows native focus loss; the fixture compares it explicitly.
The suite then opens a surviving menu and checks forward switching when multiple menus remain.
Focused-trigger disabling, disabling while its popup owns focus, backward LTR/RTL and single-menu
switching are also compared. Navigation keeps the current item's DOM position as the origin even
when that item has become disabled, using the shared Composite destination search. A wrap to the
same trigger leaves its existing popup and focus in place.

## Reviewed differences

- `disabled-trigger-tab-stop`: after disabling the current trigger, the pin leaves tabindex=0 on
  its native disabled button and every enabled sibling at -1. Angular keeps an enabled Tab entry.
  Three exact trigger-array pairs cover the initial update and subsequent closed navigation.
- `backward-close-reopen`: the pin's shared nested-list close-key handler closes the current menu
  before returning focus to its trigger. Trigger focus reopens it before Menubar advances to the
  previous sibling. Angular switches directly to that sibling. Four callback-array pairs cover
  backward LTR/RTL switching and the subsequent Escape; stable focus and completion agree.
- `single-menu-close-reopen`: with one enabled menu, the pin's close-direction arrow produces that
  same close/reopen cycle and leaves focus on the trigger. Angular preserves the focused item and
  popup. Three exact focus/callback pairs record the difference; forward navigation agrees.

- `nested-exit-completion`: switching away from an open nested branch loses its close-completion
  callback in the pin. Six exact completion-array pairs retain Angular's actual completion, as in
  [Menu's matrix](../menu/PARITY.md). Open requests, callback order and native focus agree.

These pairs retain Angular's reachable Tab entry and atomic sibling transition rather than copying
incidental React interaction plumbing. Changed or stale exceptions fail. See
[ADR 0038](../../../docs/adr/0038-menu-collection-boundaries.md).

Menus inherit whole-bar disabling through an ambient DI signal, as they already inherit modality.
Native mouse-down opens with `trigger-press`; arrow opening uses `list-navigation`. Switching opens
the new menu before closing the old one with `sibling-open`, preserving popup focus. Pointer
switching reports `trigger-hover`, then `trigger-focus` when native focus reaches the new trigger.
The existing focus manager treats sibling triggers within the bar as inside, so their native focus
transfer does not emit a premature `focus-out`. A canceled initial request does not activate the
coordinator. These are library contracts implemented with Angular DI/signals, not Angular-mandated
semantic differences or a port of React's store.

The coordinator registers its actual native host alongside the trigger interaction handler. Both
focus containment and the internal backdrop cutout use that registration, so composition through
`hostDirectives` does not require a literal `rdxMenubarRoot` attribute. Every Angular fixture in this
suite exercises that consumer composition.

Native cancellation cases cover keyboard/pointer requests and an application F5 command allowing a
retry. Activation follows accepted openings; an already-open destination does not re-close siblings.
Declared inside elements inherit through the DI owner chain. Escape uses original-event ownership,
captured before an earlier document listener can close its target. `RdxDismiss` shares that native
event gate. Logical highlight survives transfers within the coordinator.

Four vertical cases cover closed roving, LTR/RTL cross-axis opening, vertical popup items and Escape.
Closed RTL roving uses three enabled destinations. Five nested cases cover child Escape, LTR/RTL
ownership, pointer/forward-key switching and composed popup hosts without the original selector.
The composed case also wraps items. Semantic DOM fallback preserves initial focus without their
original directive attributes; Composite metadata continues to own item navigation.
Child forward navigation delegates through its DI owner instead of registering as a bar item.

Two return-arrow cases compare LTR/RTL vertical close requests and native trigger-focus reopening.
Menubar stores interaction mode independently of actual open menus, matching the pin: accepted
opening enables it, sibling/navigation closing preserves it, and other accepted closing ends it.
The popup remains mounted with its highlight; focus stays on the trigger and no extra completion
is emitted. Twenty-two vertical-return and two overlapping-state exceptions have been removed.
Four child-cancellation cases veto opening, Escape closing and arrow closing, then retry through the native application F5 command. A canceled
arrow close keeps the child open but returns focus to its trigger and clears child highlight; a
canceled Escape keeps child focus. Menu and Menubar use the same Root navigation-return operation.
It consumes and forwards the original KeyboardEvent before callbacks and resolves a surviving
trigger through DI. Only nested returns clear highlight; a top-level navigation reopen preserves it.
Submenu classification uses Root ownership, including a composed trigger without its original attribute. No parallel keyboard-focus state is introduced.

Custom horizontal popup orientation, nested pointer/selection cancellation, retained coordinator
portals and real device/AT work remain separate audits. See
[ADR 0040](../../../docs/adr/0040-menu-navigation-return.md).

Consumers observing `none` for these actions should migrate to the explicit reasons above. Popup
focus after sibling switching now follows the pin. Shared Menu limitations are tracked separately
in [Menu's matrix](../menu/PARITY.md). See [ADR 0036](../../../docs/adr/0036-menu-pointer-and-composition-contracts.md).
