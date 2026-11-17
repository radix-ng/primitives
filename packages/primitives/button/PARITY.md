# Button comparison contract

Reference: the Base UI Button and internal `useButton` implementation pinned by
[`apps/parity-testing/reference.json`](../../../apps/parity-testing/reference.json).
Run `pnpm test-parity button`; coverage and recording details live in the
[suite guide](../../../apps/parity-testing/primitives/button/README.md).

## Public API mapping

| Radix NG                | Base UI                   | Contract                                                                                  |
| ----------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| `rdxButton`             | `Button`                  | Apply the directive to the consumer's host element.                                       |
| `disabled`              | `disabled`                | Exposes `data-disabled` and suppresses consumer click activation.                         |
| `focusableWhenDisabled` | `focusableWhenDisabled`   | Keeps a disabled control in the tab order with `aria-disabled`.                           |
| `type`                  | Native `type` prop        | Native button defaults to `button`; submit/reset retain browser behavior.                 |
| `role`                  | Native `role` prop        | Explicit values override button semantics; `null` removes, `undefined` restores defaults. |
| `tabIndex`              | Native `tabIndex` prop    | Explicit values override disabled/roving defaults; `null` removes the attribute.          |
| Detected host tag       | `nativeButton` + `render` | Angular infers native button mode from `<button>`; other hosts get button semantics.      |

The Angular host API remains attribute-based and has no `nativeButton` input. Native HTML semantics
and actual browser interactions are compared; React render props and synthetic event wrappers are
framework mechanisms.

Static lowercase `tabindex` is preserved. Dynamic overrides use the signal inputs `[role]` and
`[tabIndex]`; `[attr.role]` / `[attr.tabindex]` bypass those inputs. For either input, `null` removes
the attribute and `undefined` restores the behavior's default. An explicit tabindex also overrides
Composite/Toolbar roving values, so the application then owns the resulting tab order.

## Behavior changes

- **Non-native Space activation moves from keydown to keyup.** Code that needs the completed action
  should listen for click. Holding Space no longer invokes the action for each repeat keydown, and
  releasing Space after focus leaves the host does not invoke it. Inside a Composite, Space activates
  on keydown and keyup does not add another activation.
- **Enter on `<a href>` uses native link activation.** The click is browser-generated and trusted.
  Anchors without an href and other non-native hosts synthesize Enter clicks with modifier keys.
- **Descendant keys belong to the descendant.** Enter/Space on a nested focusable element do not
  activate its enclosing Button.
- **Prevented activation defaults are respected.** A prevented Enter keydown or Space keyup blocks
  standalone non-native synthesis. Template and later-installed native host listeners run before
  Button's keyboard handling, keeping activation synchronous and allowing cancellation. Composite
  Space retains the pin's keydown policy even when a button-role consumer prevents its default.
- **Disabled presses preserve the existing focus.** Pointerdown default is prevented; a focusable
  disabled Button preserves Tab defaults while suppressing other keydown defaults.
- **Native buttons explicitly set `tabindex=0`.** This preserves the reference's keyboard tab order
  and pointer focus in WebKit on macOS. Composite items keep their own roving tabindex instead.
- **Authored role and tabindex take priority.** Static values and signal-bound updates survive
  disabled/focusable changes and composite highlight changes. Clearing the override with `undefined`
  returns the item to its current roving/default value. Preserved `menuitem`, `option` and `gridcell`
  roles also retain Base UI's prevented composite Space behavior.
- **Disabled consumer handlers are suppressed.** Click, pointerdown, mousedown, keydown and keyup
  handlers no longer run while disabled. Hover and release handlers remain available. Tab keeps its
  native default and the owning Composite still receives arrow navigation from the disabled item.
- **Toolbar.Button includes button behavior on its own.** Enter/Space activation, consumer
  cancellation, modifiers and disabled guards work without an extra `rdxButton`. Stacking both
  directives retains one activation per press.

## Composition ownership

Button uses the same host's `RdxCompositeItem.tabIndex` and the existing Composite context for keyboard
policy. Stacking `rdxToolbarButton` and `rdxButton` retains one roving tab stop, focusable disabled
items, group/root disabled state and native host semantics.

Button and Toolbar.Button provide the same element-scoped `RdxButtonBehavior` service. Both use one
set of DOM handlers; when stacked, Button supplies the effective behavior configuration. A composed
Menu trigger marks keyboard activation it already handled so the shared behavior does not toggle it
again. Those coordination helpers are internal exports between secondary entry points.

Bare Toolbar.Button on a non-native render host also retains the pin's forwarded `disabled` DOM
attribute. It does not give a span or link native disabled semantics; the shared guards enforce it.

Toolbar supplies `RdxButtonConfig` through `provideRdxButtonConfig`. This signal-based configuration
is injected only from the same element; it shares effective disabled and focusable-when-disabled
state with Button without synchronizing either primitive's inputs. Other primitive authors can use
the same provider when combining their own state with Button on one host.

The capture listener moves Button's keyboard bubble listener after existing host listeners for each
event. This lets later application listeners prevent activation before native defaults run, without
timers, microtask activation or a React event wrapper. DestroyRef removes both phases.
Disabled capture guards stop the host event before consumer handlers. For composite keydown, the
original event is explicitly relayed to the item's owning root before propagation stops. Native
ancestor propagation remains outside the comparison contract.

There are no reviewed differential exceptions in this increment. Semantic snapshots normalize
redundant false ARIA attributes and observe effective tabindex; complete DOM/event observations are
retained. Coverage does not establish all composite families, complete API, native ancestor
propagation, device or AT parity; remaining cases are listed in the suite guide.
