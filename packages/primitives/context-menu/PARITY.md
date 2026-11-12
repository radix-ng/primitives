# Context Menu — Base UI compatibility

Audited 2026-11-12 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/context-menu).
This is incremental evidence, not complete API or accessibility certification.

| Contract                                                       | Evidence                                 | Status                                               |
| -------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| Native right-click opening and virtual point anchor            | Independent pinned suite, three engines  | Covered for a native button context area             |
| Selection, outside/Escape dismissal and retained portals       | Pinned suite                             | Covered                                              |
| Canceled open/close and whole-root disabling                   | Pinned suite                             | Covered                                              |
| Reopen at another point                                        | Pinned suite                             | Covered                                              |
| Right-button drag/release                                      | Pinned suite                             | Covered; native macOS/Linux selection policy         |
| Previous-focus return                                          | Pinned suite                             | Covered; context area does not become a Menu trigger |
| Native keyboard/touch opening, slop and cancellation           | Capability-gated pinned suite            | Covered within stated browser capabilities           |
| Multiple sibling/nested areas, retained views and focus        | Pinned suite and public browser examples | Covered for areas sharing one Root                   |
| Submenus, keyboard/hover, LTR/RTL and cancellation/retry       | Pinned suite                             | Covered; reviewed WebKit coordinate-travel limit     |
| Native outside switching and canceled-close retry              | Pinned suite                             | Covered within a bounded native gesture frame        |
| Independent nested Roots, retained focus and command ownership | Pinned suite and public browser examples | Covered for nested areas and Roots inside a popup    |
| Further overlay composition                                    | Not established                          | Pending                                              |
| Whole-root removal, cleanup, final focus and recreation        | Pinned suite, three engines              | Covered; existing Angular destruction lifetimes      |
| Real devices and assistive technology                          | Not established                          | Pending                                              |

The [runner](../../../apps/parity-testing/primitives/context-menu/README.md) defines 61 scenarios. There are 183 planned comparisons; native input capabilities
currently allow 165 on macOS and 166 on Linux with the pinned Playwright/browser versions. Six exact WebKit focus/highlight pairs record the same
`zero-delta-pointer-travel` pin limitation documented in [Menu's matrix](../menu/PARITY.md): a trusted
right-button drag or child hover changes viewport coordinates while WebKit emits zero movement deltas.
Four pairs cover child hover in LTR/RTL on both platforms; two cover Linux right release. On Linux
the release leaves the menu open, so the highlight difference remains observable; macOS selects
and closes. The coordinate guard is retained, and stale or changed exceptions fail.

Nine native input cases cover keyboard context-menu keys, short tap, 500ms long-press, per-axis
10px slop, drift/cancel, two fingers and root disabling. Short taps run in Chromium/WebKit; trusted
hold/move/cancel/multi-touch uses Chromium CDP. Firefox has no Playwright touch context and WebKit
has no public hold/move API. Keyboard capability is measured on a plain native button independently
of the fixtures; unsupported browser/OS key combinations are explicit skips. No synthetic DOM
contextmenu/TouchEvent dispatch substitutes for missing native input.

Native contextmenu focuses a tabbable control when present, otherwise the popup; arrows enter the items, matching the pin.
This replaces the elapsed-time heuristic and its first-item autofocus. Explicit `openAt(...,'first')`
is still available. Touch retains its origin until completion, cancels the first timer on a second
finger, and uses per-axis rather than Euclidean slop. Pointer Events remain the Angular input path;
original pointer/touch/keyboard records and trust flags are attached without rewriting their types.

Root forwards `disabled` to the composed Menu, so context areas and `openAt()` honor whole-root
disabling. Per-area disabling remains supported. Before opening, Root captures the actual focused
element for the existing focus manager's default return policy. A right-click may leave focus
elsewhere, especially in WebKit on macOS; forcing focus to the context area would change that native
contract. The area remains separate from Menu trigger registration, ARIA identity and virtual anchor.

See [ADR 0036](../../../docs/adr/0036-menu-pointer-and-composition-contracts.md). Shared Menu behavior
and its reviewed limitations are tracked separately in [Menu's matrix](../menu/PARITY.md).

Sixteen composition cases cover shared sibling/nested areas, point repositioning, prior-focus return
and retained view reuse. Keyboard/pointer submenus run in LTR/RTL. Child open/close and parent selection
vetoes retry through application policy. The nearest area consumes the gesture even when opening is
canceled. Every area's open/pressed state reflects the shared Root, without registering a Menu trigger.

Secondary outside presses close through shared dismissal. A vetoed pointerdown can be requested again
by its native mousedown; accepted closing releases backdrop hit testing and outside isolation before
contextmenu reaches another area. A compatibility mouse event from the touch which opened the menu
is ignored. Atomic navigation return keeps its enter phase; reopening after a microtask boundary starts
a new completion cycle and retains the outside return target during interrupted exit. Switching bounds
one gesture's JS paint cadence using the shared Playwright clock, with real events and targets. Fully
closed sessions are also compared. See [ADR 0045](../../../docs/adr/0045-context-menu-composition-and-native-dismissal.md).

## Whole-root removal

The shared removal block compares conditional destruction of the entire Root, with open submenus,
retained views, paused CSS exits, a deferred close and a pending hover. Explicit final-focus targets
are tested both connected and removed with the Root. Cleanup restores background interaction, native
scrolling and document styles; no isolation attributes, guards or internal backdrops remain. Native
keyboard input works without a Root. Recreating the Root and advancing old timer deadlines does not
revive an old child or complete an abandoned close.

Angular uses its existing embedded-view and DestroyRef lifetimes. Destruction is not an invented
close transaction: callbacks, completion arrays and focus are observed against the pin unchanged.
Resource comparisons cover actual background hiding/hit testing and scroll blocking; raw framework
attributes/guard counts are recorded as measurements. See [ADR 0046](../../../docs/adr/0046-menu-root-removal.md).

Nine scenarios apply to Context Menu. The two other families each add a non-modal case; Base UI
Context Menu exposes no non-modal Root prop.

## Independent nested Roots

Sixteen new cases cover independent areas and a Context Menu Root inside an already-open popup.
Outer disabling does not disable the inner Root; a disabled inner area can fall through to an enabled
outer area. Canceling inner opening still consumes the gesture. Selection, canceled closing/retry,
Escape and outside dismissal preserve the outer menu. Genuine Menu submenus retain their own
keyboard return/close chain. Application removal and recreation follow embedded-view ownership.

Retained cases check real pointer selection after reopening. Registered descendant portals stay
interactive through outer isolation; only the backdrop's owner handles a press on its newly inserted
backdrop. A same-gesture switch returns focus through a surviving target when the old popup was
removed. Mounted membership is recorded by owner for independent portals, whose sibling insertion
order is not a shared API; pointer hit testing, focus and all requests/completions are still compared.

The 48 new comparisons introduce no exceptions. Menu state uses a self-scoped DI boundary; shared
floating ancestry remains intact. See [ADR 0047](../../../docs/adr/0047-independent-context-menu-roots.md).
