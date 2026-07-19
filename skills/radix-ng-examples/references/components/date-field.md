# Date Field

Enables users to input specific dates within a designated field.

> Index — full source of each example is one click away in `../examples/date-field--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Full keyboard navigation
- ✅ Can be controlled or uncontrolled
- ✅ Focus is fully managed
- ✅ Localization support
- ✅ Highly composable
- ✅ Accessible by default
- ✅ Supports both date and date-time formats
- ✅ Uses `null` as the empty value for stable Angular Signal Forms fields

## Anatomy

Import all parts and piece them together.

```html
<div rdxDateFieldRoot>
    <div rdxDateFieldInput></div>
    <input rdxVisuallyHiddenInput />
</div>
```

## Examples

- [With locale](../examples/date-field--with-locale.md)
- [Invalid](../examples/date-field--invalid.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/date-field.json`
- Styling (parts + `data-*`): `references/styling-contract/date-field.json`
