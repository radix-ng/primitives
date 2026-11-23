# Field

Groups a control with accessible label, description, error message, and field state.

> Index — full source of each example is one click away in `../examples/field--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Wires labels to controls with `for` and generated control ids.
- ✅ Wires descriptions and errors with `aria-describedby`.
- ✅ Exposes state via `data-invalid`, `data-disabled`, `data-required`, `data-dirty`, `data-touched`, `data-filled`, and `data-focused`.
- ✅ Works with native controls and custom controls.
- ✅ Bridges Reactive Forms and `ngModel` without repeated state bindings.
- ✅ Matches errors by native constraint or Angular validation key.
- ✅ Inherits disabled state from the enclosing Fieldset.

## Import

```typescript
import {
  RdxFieldRoot,
  RdxFieldLabel,
  RdxFieldControl,
  RdxFieldDescription,
  RdxFieldError,
  RdxFieldValidity,
  RdxNgControlField
} from '@radix-ng/primitives/field';
```

## Anatomy

```html
<div rdxFieldRoot>
  <label rdxFieldLabel>Label</label>
  <input rdxFieldControl />
  <p rdxFieldDescription>Description</p>
  <p rdxFieldError>Error</p>
</div>
```

For a plain native `rdxFieldControl`, use the browser's constraints such as `required`, `type="email"`,
or `pattern`. An enclosing `rdxFormRoot` checks those constraints on submit and focuses the first
invalid control. Set `match="valueMissing"` or `match="typeMismatch"` to describe a specific native
constraint. An Angular Forms adapter supplies validation when it owns the control's invalid state.

For a checkbox or radio group where each control needs its own label and description, wrap each one in a
`rdxFieldItem`. The item scopes the label / description / control association to its control while
reflecting the field's validation state; its `disabled` is OR'd with the root's.

```html
<div rdxFieldRoot>
  <div rdxFieldItem>
    <label rdxFieldLabel>Option A</label>
    <input rdxFieldControl type="radio" />
    <p rdxFieldDescription>Description A</p>
  </div>
  <div rdxFieldItem>
    <label rdxFieldLabel>Option B</label>
    <input rdxFieldControl type="radio" />
  </div>
  <p rdxFieldError>Error</p>
</div>
```

## Examples

- [Default](../examples/field--default.md)
- [Invalid](../examples/field--invalid.md)
- [Reactive Forms](../examples/field--reactive-forms.md)
- [Custom Control](../examples/field--custom-control.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/field.json`
- Styling (parts + `data-*`): `references/styling-contract/field.json`
