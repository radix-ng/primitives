# Popover — Base UI compatibility

Audited 2026-11-10 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/popover).
This is incremental behavioral coverage, not complete API or accessibility certification.

| Contract                                                    | Evidence                         | Status                                     |
| ----------------------------------------------------------- | -------------------------------- | ------------------------------------------ |
| Keyboard, pointer, toggle, disabled                         | Pinned suite, three engines      | Covered scenarios                          |
| Cancelable open/close and completion ordering               | Pinned suite                     | Covered scenarios                          |
| Default/explicit autofocus, Escape return                   | Pinned suite                     | Covered scenarios                          |
| Modal/trap-focus wrapping and outside dismissal             | Pinned suite                     | Covered scenarios; exact differences below |
| Trigger switch and native text editing                      | Pinned suite                     | Covered scenarios                          |
| Live/frozen tracking, clipping recovery                     | Pinned suite                     | Covered scenarios                          |
| Arrow, structural portal, scroll-lock release               | Angular Storybook regressions    | Pinned comparisons pending                 |
| CSS/deferred exit, retained draft and interrupted reopening | Pinned suite, three engines      | Covered scenarios                          |
| Select child, modal child and custom portal                 | Select differential suite        | Composition scenarios covered              |
| Hover/grace areas, handles/payloads, RTL                    | Not yet compared                 | Pending                                    |
| Real Safari/devices and assistive technology                | Automation cannot establish this | Manual verification pending                |

The [runner](../../../apps/parity-testing/primitives/popover/README.md) defines 25 scenarios,
75 engine comparisons and four exact browser/platform-scoped difference entries (three per tested platform): an outside button press is
`outside-press` in Angular versus `focus-out` in the pin (Chromium/Firefox and Linux WebKit), and canceled Close
retains native macOS Safari button click-focus behavior. These are recorded limitations; do not silently
normalize reason payloads or add tabindex to every native button to erase them.

Default autofocus waits for a positioned popup, restores the portal's natural tabbable candidates,
and focuses the first candidate. Managed modal scopes loop at both Tab edges and release trapping
at logical close. Default return uses the actual trigger for an interaction-driven open if focus
has not deliberately moved elsewhere; explicit return policies retain their priority.

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

Next: hover/grace areas, detached handles/payloads and RTL/Arrow comparisons. Menu has its own
independent differential suite and shares the close lifecycle (ADR 0035); other families still
retain their existing close implementations.
