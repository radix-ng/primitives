# Popover — Base UI compatibility

Audited 2026-11-10 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/popover).
This is incremental behavioral coverage, not complete API or accessibility certification.

| Contract                                                              | Evidence                         | Status                                     |
| --------------------------------------------------------------------- | -------------------------------- | ------------------------------------------ |
| Keyboard, pointer, toggle, disabled                                   | Pinned suite, three engines      | Covered scenarios                          |
| Cancelable open/close and completion ordering                         | Pinned suite                     | Covered scenarios                          |
| Default/explicit autofocus, Escape return                             | Pinned suite                     | Covered scenarios                          |
| Modal/trap-focus wrapping and outside dismissal                       | Pinned suite                     | Covered scenarios; exact differences below |
| Trigger switch and native text editing                                | Pinned suite                     | Covered scenarios                          |
| Live/frozen tracking, clipping recovery                               | Pinned suite                     | Covered scenarios                          |
| Arrow, structural portal, exit animation, scroll-lock release         | Angular Storybook regressions    | Pinned comparisons pending                 |
| Select child, modal child and custom portal                           | Select differential suite        | Composition scenarios covered              |
| Hover/grace areas, handles/payloads, deferred/retained lifecycle, RTL | Not yet compared                 | Pending                                    |
| Real Safari/devices and assistive technology                          | Automation cannot establish this | Manual verification pending                |

The [runner](../../../apps/parity-testing/primitives/popover/README.md) defines 15 scenarios,
45 engine comparisons and four exact browser/platform-scoped difference entries (three per tested platform): an outside button press is
`outside-press` in Angular versus `focus-out` in the pin (Chromium/Firefox and Linux WebKit), and canceled Close
retains native macOS Safari button click-focus behavior. These are recorded limitations; do not silently
normalize reason payloads or add tabindex to every native button to erase them.

Default autofocus waits for a positioned popup, restores the portal's natural tabbable candidates,
and focuses the first candidate. Managed modal scopes loop at both Tab edges and release trapping
at logical close. Default return uses the actual trigger for an interaction-driven open if focus
has not deliberately moved elsewhere; explicit return policies retain their priority.

Next: compare animation/deferred unmount and fast retained reopening before expanding the hover API.
