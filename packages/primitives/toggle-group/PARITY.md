# ToggleGroup parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned ToggleGroup source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/toggle-group).

## Array ownership and forms

| Boundary            | Contract                                                                                                                                                 | Evidence                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| P1 · Controlled     | A supplied `controlledValue` owns the selection, including an empty array. The parent can ignore, delay or replace a request.                            | Paired `controlled`.                 |
| P1 · Editable model | `value` is the editable array for two-way binding, CVA and Signal Forms. Initial writes take precedence over `defaultValue`.                             | Angular units and SSR.               |
| P1 · Defaults       | A default is applied once. Later defaults leave the current selection intact, including when the first default arrives late.                             | Paired `default` and `late-default`. |
| P1 · Native reset   | Restore the initial editable array, including an explicit empty array. Angular Forms reset through their own control. Canceled resets preserve the edit. | Angular native form units.           |

Using `name` serializes the selection as repeated native form entries. Explicit `form` ownership,
CVA and Signal Forms are Angular contracts.

## Navigation and composition

A group owns its Toggle items' pressed state in single and multiple modes. The regular root owns
roving focus. `rdxToggleGroupWithoutFocus` delegates focus to the enclosing composite, such as
Toolbar. Compare keyboard navigation, disabled handling and both levels of cancellation across
the standalone and toolbar compositions.

Run `pnpm test-parity toggle-group` for the [paired suite](../../../apps/parity-testing/primitives/toggle-group/README.md).
