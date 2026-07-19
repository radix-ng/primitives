# Input

A native text input with headless state attributes and Field integration.

> Index — full source of each example is one click away in `../examples/input--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Works as a standalone native input.
- ✅ Integrates with Field labels, descriptions, errors, and state.
- ✅ Supports controlled value, default value, disabled, required, and invalid states.
- ✅ Exposes state through data attributes for styling.

## Import

```ts
import { RdxInputDirective } from '@radix-ng/primitives/input';
```

## Anatomy

Use `rdxInput` directly on a native input. Wrap it in Field when you need label, description, and error relationships.

```html
<div rdxFieldRoot>
    <label rdxFieldLabel>Email</label>
    <input rdxInput />
    <p rdxFieldDescription>Used for account notifications.</p>
    <p rdxFieldError>Enter a valid email address.</p>
</div>
```

## Examples

- [Disabled](../examples/input--disabled.md)
- [With Field](../examples/input--with-field.md)
- [Reactive Forms](../examples/input--reactive-forms.md)
- [Signup Form](../examples/input--signup-form.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/input.json`
- Styling (parts + `data-*`): `references/styling-contract/input.json`
