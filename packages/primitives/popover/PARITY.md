# Popover — Base UI compatibility

Audited 2026-11-14 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/popover).
This is incremental behavioral coverage, not complete API or accessibility certification.

| Contract                                                    | Evidence                         | Status                                          |
| ----------------------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| Keyboard, pointer, toggle, disabled                         | Pinned suite, three engines      | Covered scenarios                               |
| Cancelable open/close and completion ordering               | Pinned suite                     | Covered scenarios                               |
| Default/explicit autofocus, Escape return                   | Pinned suite                     | Covered scenarios                               |
| Modal/trap-focus wrapping and outside dismissal             | Pinned suite                     | Covered scenarios; exact differences below      |
| Secondary outside press                                     | Pinned suite, three engines      | Intentional default/modal; immediate trap-focus |
| Trigger switch and native text editing                      | Pinned suite                     | Covered scenarios                               |
| Live/frozen tracking, clipping recovery                     | Pinned suite                     | Covered scenarios                               |
| Arrow, structural portal, scroll-lock release               | Angular Storybook regressions    | Pinned comparisons pending                      |
| CSS/deferred exit, retained draft and interrupted reopening | Pinned suite, three engines      | Covered scenarios                               |
| Select child, modal child and custom portal                 | Select differential suite        | Composition scenarios covered                   |
| Hover/grace areas, handles/payloads, RTL                    | Not yet compared                 | Pending                                         |
| Real Safari/devices and assistive technology                | Automation cannot establish this | Manual verification pending                     |

The [runner](../../../apps/parity-testing/primitives/popover/README.md) defines 28 scenarios,
84 engine comparisons and one exact macOS WebKit difference: canceled Close retains native Safari
button click-focus behavior. Outside close now reports the native focus-out reason in line with the
pin; the three earlier outside-close-reason entries are removed. Payloads are observed directly.

Default autofocus waits for a positioned popup, restores the portal's natural tabbable candidates,
and focuses the first candidate. Managed modal scopes loop at both Tab edges and release trapping
at logical close. Default return uses the actual trigger for an interaction-driven open if focus
has not deliberately moved elsewhere; explicit return policies retain their priority.

An ordinary or modal Popover waits for a completed primary click; a secondary press on unfocusable
background does not dismiss it. Trap-focus mode closes on pointerdown. Focus recovery only repairs
removed or hidden content: a visible field's native blur must not refocus the popup or change the
reason reported by the next outside click. Three secondary-press cases compare these phases and
the actual native focus without new difference exceptions.

## Close lifecycle increment

Ten additional scenarios compare natural CSS exits with and without retained DOM, a deferred close,
manual and duplicate completion, a late hold during a real exit, a canceled hold, interrupted CSS
and deferred exits, and modal background recovery. Native draft values survive only when the same
view stays mounted. Reopening before completion restores initial focus and discards the old close;
calling a stale unmount while open does nothing. No new difference exceptions were needed.

Root reuses the same `usePopupLifecycle` as Select. Portal forwards `keepMounted`; Root exposes
`unmount()` directly through its Angular export. Inactive retained views hide, stop positioning and
deactivate their focus scope. Pending exits suppress pointer events without adding native inert,
matching the pin's preserved native keyboard focus. The manager's default autofocus fallback also
handles interrupted exits where the scope never unmounted.

**Migration:** `root.close()` defaults to `imperative-action` instead of `none`. A deferred close
emits completion only after `unmount()`; start an external animation in `onOpenChange`, then finish
it through the Root method. See [ADR 0033](../../../docs/adr/0033-popover-shared-close-lifecycle.md).

## Menu composition refinement

Menu's separate item-to-Popover increment verifies persistent anchors, completion, nested editors,
hover return and outside-focus reasons. Shared isolation now keeps declared previous/next focus
targets usable while continuing to inert unrelated controls and mark the outside subtree. A first
Popover Root follows its family focus boundary through declaration DI; nested Popovers retain
related-ancestor behavior. See [ADR 0066](../../../docs/adr/0066-menu-item-popover-focus-boundaries.md).

Next: hover/grace areas, detached handles/payloads and RTL/Arrow comparisons. Menu composition does
not certify these remaining independent Popover contracts.
