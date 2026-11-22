# Toggle parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned Toggle source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/toggle).

## Pressed state

| Boundary             | Contract                                                                                                                                     | Evidence                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| P1 · Controlled      | A supplied `pressed` owns the effective state, including false. The parent can ignore, delay or replace the request.                         | Paired `controlled`.                 |
| P1 · Uncontrolled    | `defaultPressed` is read once. Later defaults leave the initial or edited value in place.                                                    | Paired `default` and `late-default`. |
| P1 · Change requests | `onPressedChange` can cancel a request. Standalone `pressedChange` supports `[(pressed)]` for accepted requests.                             | Paired `canceled` and unit tests.    |
| P1 · Group ownership | Inside ToggleGroup, the group array drives `aria-pressed` and `data-pressed`. The item and group receive the same cancelable change details. | Existing group units.                |

The effective `pressed()` is readable from the directive. Clearing the Angular binding exposes the
local uncontrolled value. The pinned reference fixes ownership mode at mount.

## Activation and composition

The [Button parity suite](../../../apps/parity-testing/primitives/button/README.md) covers
Toggle in Toolbar, including composed native and custom hosts and disabled states.
Compare standalone native/custom activation and grouped keyboard navigation in dedicated scenarios.

Run `pnpm test-parity toggle` for the [paired suite](../../../apps/parity-testing/primitives/toggle/README.md).
