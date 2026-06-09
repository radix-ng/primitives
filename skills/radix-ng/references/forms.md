# Forms

Compose form UIs from **Fieldset → Field → control**. This gives real, accessible structure: every
control has an associated label, optional description, and error text, and inherits invalid/disabled/
required state.

## Field

`Field` groups one control with its label, description, and error message.

```html
<div rdxFieldRoot>
  <label rdxFieldLabel>Email</label>
  <input rdxInput rdxFieldControl type="email" />
  <p rdxFieldDescription>We'll never share it.</p>
  <p rdxFieldError>Enter a valid email.</p>
</div>
```

Parts: `rdxFieldRoot`, `rdxFieldLabel`, `rdxFieldDescription`, `rdxFieldError`, and either
`rdxFieldControl` or a compatible control such as `rdxInput`. The label is wired to the control
automatically — no manual `for`/`id`.

## Input

`input[rdxInput]` is the headless native text input. It works standalone, but wrap it in `Field`
whenever it needs a label, description, error, or inherited state.

## Fieldset

`Fieldset` groups related fields with native `fieldset`/`legend` semantics.

```html
<fieldset rdxFieldsetRoot>
  <legend rdxFieldsetLegend>Shipping address</legend>
  <!-- rdxFieldRoot groups here -->
</fieldset>
```

Disabled state belongs on the root and is exposed to the legend via `data-disabled`.

## Other form controls

Checkbox, Radio, Switch, Toggle, Slider, Select, Number/Date/Time field, and Calendar are all
form controls — see their bundled `.md` for value binding and validation examples. Checkbox, Radio,
and Switch are the cleanest references for reactive and template-driven forms.

## Label association is mandatory

Every visible label must be programmatically connected to its control:

- native controls → `for`/`id`,
- `RdxLabelDirective` → `htmlFor`,
- inside `rdxFieldRoot` → `rdxFieldLabel` (association is automatic).

Never leave a visual label next to an input/checkbox/radio/switch without an association.
