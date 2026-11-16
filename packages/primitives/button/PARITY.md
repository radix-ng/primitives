# Button comparison contract

Reference: the Base UI Button and internal `useButton` implementation pinned by
[`apps/parity-testing/reference.json`](../../../apps/parity-testing/reference.json).
Run `pnpm test-parity button`; coverage and recording details live in the
[suite guide](../../../apps/parity-testing/primitives/button/README.md).

## Public API mapping

| Radix NG                | Base UI                   | Contract                                                                             |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| `rdxButton`             | `Button`                  | Apply the directive to the consumer's host element.                                  |
| `disabled`              | `disabled`                | Exposes `data-disabled` and suppresses consumer click activation.                    |
| `focusableWhenDisabled` | `focusableWhenDisabled`   | Keeps a disabled control in the tab order with `aria-disabled`.                      |
| `type`                  | Native `type` prop        | Native button defaults to `button`; submit/reset retain browser behavior.            |
| Detected host tag       | `nativeButton` + `render` | Angular infers native button mode from `<button>`; other hosts get button semantics. |

The Angular host API remains attribute-based and has no `nativeButton` input. Native HTML semantics
and actual browser interactions are compared; React render props and synthetic event wrappers are
framework mechanisms.

## Behavior changes

- **Non-native Space activation moves from keydown to keyup.** Code that needs the completed action
  should listen for click. Holding Space no longer invokes the action for each repeat keydown, and
  releasing Space after focus leaves the host does not invoke it.
- **Enter on `<a href>` uses native link activation.** The click is browser-generated and trusted.
  Anchors without an href and other non-native hosts synthesize Enter clicks with modifier keys.
- **Descendant keys belong to the descendant.** Enter/Space on a nested focusable element do not
  activate its enclosing Button.
- **Prevented activation defaults are respected.** A prevented Enter keydown or Space keyup blocks
  non-native synthesis when the event is already prevented when the primitive handles it.
- **Disabled presses preserve the existing focus.** Pointerdown default is prevented; a focusable
  disabled Button preserves Tab defaults while suppressing other keydown defaults.
- **Native buttons explicitly set `tabindex=0`.** This preserves the reference's keyboard tab order
  and pointer focus in WebKit on macOS.

There are no reviewed differential exceptions in this increment. Semantic snapshots normalize
redundant false ARIA attributes and observe effective tabindex; complete DOM/event observations are
retained. This does not establish complete API, native propagation, composite, device or AT parity.
