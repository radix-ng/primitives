# Field parity matrix

Reference: Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.
[Manifest](../../../apps/parity-testing/reference.json),
[pinned Field source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/field).

| Boundary                  | Contract                                                                                                                                                                                                              | Evidence                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| P1 · Form state ownership | A plain native Control registers its browser constraints. Form refreshes validity before submit and focuses the first invalid control in document order. Angular adapters can supply validation for the same anatomy. | Paired `native-constraints` and unit tests.                                 |
| P1 · Provider precedence  | A disabled Fieldset, Field Root or adapter disables the field. The latest live provider owns its reported metadata. Explicit dirty and touched inputs cover the states left unowned by the adapter.                   | Paired `fieldset-disabled` and unit tests.                                  |
| P1 · Error ownership      | A native edit clears the server error for the nearest Field. Each adapter unregisters its own state and remaining live registrations can resume ownership.                                                            | Paired `nested-server-errors` and units.                                    |
| P2 · Relationships        | Label follows the mounted control. Authored names and descriptions survive replacement of Label, Description and Error. Shared status attributes reach all Field parts.                                               | Paired `public-relationships`, units and hydration.                         |
| P2 · Validity and timing  | Angular templates read the displayed tri-state validity and messages through `rdxFieldValidity`. `validationMode` selects the reveal boundary. Automatic errors hide while disabled.                                  | Paired `public-relationships` and `default-validation-mode`, units and SSR. |

Field coordinates state from the browser, Form and Angular Forms. The control retains value
ownership. A plain native Control provides its constraint flags and focus target. A Field adapter
with an invalidity accessor supplies validation for that Control. The Form mode is a fallback
when the Field has no explicit mode.

## Angular behavior

- The latest live Field adapter supplies its declared states, including explicit `false`. Omitted
  interaction states use Root overrides, then control observations and Form's per-name state.
  Any of Fieldset, Field and the adapter can disable the field.
- Angular scopes descriptions and server errors to each Field. The pinned Base UI LabelableProvider
  also passes the parent's error ID to nested controls. The paired fixture asserts both scopes and
  compares clear-on-edit behavior.
- Field and Form default to `onBlur` so standalone Angular fields can reveal errors without a Form.
  The reference defaults to `onSubmit`. The paired default-mode scenario verifies each default and
  their shared behavior on submit. An explicit `validationMode="onSubmit"` opts in to the same
  reveal boundary.
- `RdxFieldValidity` exposes validity, pending state, and messages through a template reference.
  Angular templates read the current and initial value from the owning control or form model.
  Error retains its authored host with `hidden` and `aria-live="polite"`. Base UI's Error part
  manages exit transitions and unmounts the element.
- The Signal Forms and NgControl adapters remain explicit as described in
  [ADR 0018](../../../docs/adr/0018-signal-forms-adapter.md) and
  [ADR 0021](../../../docs/adr/0021-ng-control-field-adapter.md).

## Verification

- Run `pnpm test-parity field` for [the paired suite](../../../apps/parity-testing/primitives/field/README.md)
  in Chromium, Firefox and WebKit.
- Field and Form unit specs cover interaction overrides, shared and item-level constraints and
  registration lifetime. Signal Forms and NgControl specs exercise framework-owned validation.
- The Input, Checkbox, Switch and Radio suites exercise integrations with their own control hosts.
  The shared SSR suite covers named Form errors and Field associations on the server.
- Run `node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-field` to verify node reuse,
  IDs, authored relationships, and server-error cleanup in Chromium, Firefox and WebKit.
