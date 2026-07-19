# Fieldset

Groups related form controls with a legend and shared disabled state.

> Index — full source of each example is one click away in `../examples/fieldset--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Uses native `fieldset` and `legend` semantics.
- ✅ Disables all form controls in the group with one prop.
- ✅ Exposes disabled state with `data-disabled`.
- ✅ Composes with Field and Input.

## Import

```typescript
import { RdxFieldsetRoot, RdxFieldsetLegend } from '@radix-ng/primitives/fieldset';
```

## Anatomy

```html
<fieldset rdxFieldsetRoot>
  <legend rdxFieldsetLegend>Shipping address</legend>
  <!-- fields -->
</fieldset>
```

## Examples

- [Default](../examples/fieldset--default.md)
- [Disabled](../examples/fieldset--disabled.md)
- [Signup form](../examples/fieldset--signup-form.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/fieldset.json`
- Styling (parts + `data-*`): `references/styling-contract/fieldset.json`
