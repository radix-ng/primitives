# Toast comparisons

Run `pnpm test-parity toast` to compare Angular with the pinned Base UI in Chromium, Firefox, and
WebKit. The fixtures use each library's Provider, manager, Portal, Viewport, Root, and Close parts.
Both fixtures apply the same CSS to hide limited notifications.

| Scenarios                                           | Observations                                                                                                                      |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `queue-overflow`, `queue-live-limit`                | DOM retention, `data-limited`, `inert`, visible stack indices, promotion on close, live limits, and close/remove callbacks        |
| `timer-copy-update`, `timer-explicit-reset`         | Provider deadline after a content update and replacement deadline after a timeout update                                          |
| `timer-hover-and-focus`                             | Hover and keyboard focus as overlapping holds, then dismissal after the remaining time                                            |
| `timer-promise-default`, `timer-promise-persistent` | Pending lifetime, settled content and type, provider fallback, and explicit zero timeout                                          |
| `portal-keyboard-restore`, `portal-focus-next`      | Portal placement, region name and live policy, F6, Tab and Shift+Tab, Escape, next-toast focus and return to the original control |

The timer scenarios advance a paused Playwright clock. Queue states match by notification ID.
The overflow scenario also records native order. The [reviewed difference](expected-differences.json)
captures Angular's oldest-first DOM and Base UI's newest-first DOM. Both place the newest visible
item at stack index zero.

The [Toast matrix](../../../../packages/primitives/toast/PARITY.md) links the Angular checks for exit
motion, anchored position, and gestures. The [hydration audit](../../../radix-ssr-testing/hydration-audit/README.md)
checks the initial notification, portal relocation, and keyboard interaction after hydration.
