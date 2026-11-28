# Toast comparisons

Run `pnpm test-parity toast` to compare Angular with the pinned Base UI in Chromium, Firefox, and
WebKit. The fixtures use each library's Provider, manager, Portal, Viewport, Root, Action and Close parts.
Both fixtures apply the same CSS to hide limited notifications.

| Scenarios                                                            | Observations                                                                                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `queue-overflow`, `queue-live-limit`                                 | DOM retention, `data-limited`, `inert`, visible stack indices, promotion on close, live limits, and close/remove callbacks                       |
| `timer-copy-update`, `timer-explicit-reset`                          | Provider deadline after a content update and replacement deadline after a timeout update                                                         |
| `timer-hover-and-focus`                                              | Hover and keyboard focus as overlapping holds, then dismissal after the remaining time                                                           |
| `timer-promise-default`, `timer-promise-persistent`                  | Pending lifetime, settled content and type, provider fallback, and explicit zero timeout                                                         |
| `request-shared-id-settlement-order`                                 | A shared ID receives both settlements in order and the latest upsert owns the lifecycle callbacks                                                |
| `request-settlement-during-exit`, `request-settlement-after-removal` | Settlement leaves a closing or removed notification unchanged and repeated close emits once                                                      |
| `request-reuse-during-exit`                                          | Reuse of the native Root, cancellation of the first CSS exit, delivery of results to the active ID, and removal only after the replacement exits |
| `controls-native-activation`, `controls-custom-activation`           | Native and custom host semantics, pointer and Enter/Space activation, form submit type, and cancellation in the authored Close handler           |
| `controls-native-disabled`, `controls-custom-disabled`               | Native and ARIA disabled state, blocked activation, and recovery after enabling                                                                  |
| `portal-keyboard-restore`, `portal-focus-next`                       | Portal placement, region name and live policy, F6, Tab and Shift+Tab, Escape, next-toast focus and return to the original control                |

`swipe-lock-right` and `swipe-lock-down` check the motion offsets and direction on diagonal drags.
`swipe-short` checks short releases and the 40/41 px boundary. `swipe-reverse` checks the change of
mind, and `swipe-pointercancel` delivers a cancel event during a native mouse drag and checks the
next swipe. `swipe-interactive-descendants` covers a nested button target and both Base UI ignore
markers. Both gesture surfaces disable text selection so each drag exercises the primitive's
pointer handling. These comparisons exercise mouse input in the three engines.

The timer scenarios advance a paused Playwright clock. Queue states match by notification ID.
The request scenarios hold real CSS exits in both fixtures and complete them through WAAPI.
The [reviewed differences](expected-differences.json) capture Angular's oldest-first DOM and Base UI's
newest-first DOM. Both place the newest visible item at stack index zero. Angular also keeps Close
exposed to assistive technology while the stack is collapsed.

The [Toast matrix](../../../../packages/primitives/toast/PARITY.md) links the Angular checks for exit
motion, anchored position, and gestures. The [hydration audit](../../../radix-ssr-testing/hydration-audit/README.md)
checks the initial notification, portal relocation, and keyboard interaction after hydration.
