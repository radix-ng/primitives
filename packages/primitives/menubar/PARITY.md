# Menubar — Base UI compatibility

Audited 2026-11-10 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/menubar).
This is incremental evidence, not complete API or accessibility certification.

| Contract                                                             | Evidence                                | Status                       |
| -------------------------------------------------------------------- | --------------------------------------- | ---------------------------- |
| Keyboard and native mouse-down opening                               | Independent pinned suite, three engines | Covered                      |
| Closed roving, Home/End and disabled-trigger skipping                | Pinned suite                            | Covered                      |
| Keyboard/pointer sibling switching and RTL                           | Pinned suite                            | Covered                      |
| Whole-bar disabling                                                  | Pinned suite                            | Covered                      |
| Selection, cancellation, outside dismissal and Tab                   | Pinned suite                            | Covered for initial requests |
| Reason, native event, callback order and focus ownership             | Pinned suite                            | Covered in the cases above   |
| Dynamic insertion/removal/reordering, labels and unfocused disabling | Pinned suite                            | Covered                      |
| Vertical navigation and nested submenus                              | Angular regressions vary                | Pinned comparisons pending   |
| Touch, real devices and assistive technology                         | Not established                         | Pending                      |

The [runner](../../../apps/parity-testing/primitives/menubar/README.md) defines 17 scenarios and
51 comparisons. No expected differences are registered in this initial scope.

Five dynamic cases insert/remove/reorder top-level menus and change an unfocused trigger's
`disabled` state or a label. Roving tabindex follows the actual focused trigger as DOM order changes;
focus lost while Angular moves a surviving keyed node is repaired through the shared DOM observer.
Removing a closed focused trigger follows native focus loss; the fixture compares it explicitly.
The suite then opens a surviving menu and checks forward switching when multiple menus remain.
Focused-trigger disabling, single-menu cross-axis behavior and backward switching's interim
close/reopen callback ordering in the pin remain separate audit work.

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

Consumers observing `none` for these actions should migrate to the explicit reasons above. Popup
focus after sibling switching now follows the pin. Shared Menu limitations are tracked separately
in [Menu's matrix](../menu/PARITY.md). See [ADR 0036](../../../docs/adr/0036-menu-pointer-and-composition-contracts.md).
