# Toggle parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned Toggle source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/toggle).

## Pressed state

| Boundary             | Contract                                                                                                                                     | Evidence                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| P1 · Controlled      | A supplied `pressed` owns the effective state, including false. The parent can ignore, delay or replace the request.                         | Paired `controlled`.                        |
| P1 · Uncontrolled    | `defaultPressed` is read once. Later defaults leave the initial or edited value in place.                                                    | Paired `default` and `late-default`.        |
| P1 · Change requests | `onPressedChange` can cancel a request. Standalone `pressedChange` supports `[(pressed)]` for accepted requests.                             | Paired `canceled` and unit tests.           |
| P1 · Group ownership | Inside ToggleGroup, the group array drives `aria-pressed` and `data-pressed`. The item and group receive the same cancelable change details. | Paired ToggleGroup `single` and `multiple`. |

Inside a group, omitted and empty item values get distinct, stable generated identities.
Paired ToggleGroup `generated-values` covers repeated selection and disabled tab order.

The effective `pressed()` is readable from the directive. Clearing the Angular binding exposes the
local uncontrolled value. The pinned reference fixes ownership mode at mount.

## Activation and composition

| Boundary                    | Contract                                                                                                            | Evidence                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| P2 · Standalone activation  | Enter acts on keydown and Space on keyup. Forward the original DOM click, with modifiers preserved on custom hosts. | Paired `native-activation` and `custom-activation`.       |
| P2 · Disabled and tab order | A disabled custom host is skipped by Tab and ignores activation. Authored tab indices override the default.         | Paired `custom-disabled` and authored tab index unit.     |
| P2 · Composite activation   | Grouped Space produces one click on keydown. Toolbar composition shares keyboard handling with the owning button.   | ToggleGroup `multiple` and Button's Toolbar Toggle cases. |

See the [ToggleGroup](../toggle-group/PARITY.md) and [Button](../button/PARITY.md) matrices for
group and Toolbar coverage.

Run `pnpm test-parity toggle` for the [paired suite](../../../apps/parity-testing/primitives/toggle/README.md).
