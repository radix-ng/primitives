# Number Field

A numeric input with stepper buttons, drag-to-scrub, locale-aware formatting and keyboard control.

> Index — full source of each example is one click away in `../examples/number-field--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Controlled or uncontrolled value, with cancelable `(onValueChange)` and `(onValueCommitted)`.
- ✅ Stepper buttons with press-and-hold auto-repeat.
- ✅ Keyboard control — arrow keys, `Home`/`End`, plus `Alt` (small) and `Shift` (large) steps.
- ✅ Drag-to-scrub via the Scrub Area (Pointer Lock with an optional virtual cursor).
- ✅ Optional mouse-wheel scrubbing while focused.
- ✅ Locale-aware parsing and formatting (decimal, percent, currency, unit) via `Intl.NumberFormat`.
- ✅ `min`/`max` clamping with optional `allowOutOfRange` for direct text entry, and `snapOnStep`.
- ✅ Works with Angular reactive and template-driven forms.

## Import

```ts
import {
  RdxNumberFieldRoot,
  RdxNumberFieldGroup,
  RdxNumberFieldInput,
  RdxNumberFieldIncrement,
  RdxNumberFieldDecrement,
  RdxNumberFieldScrubArea,
  RdxNumberFieldScrubAreaCursor
} from '@radix-ng/primitives/number-field';
```

## Anatomy

Import all parts and piece them together.

```html
<div rdxNumberFieldRoot>
  <span rdxNumberFieldScrubArea>
    <label>Label</label>
    <span rdxNumberFieldScrubAreaCursor></span>
  </span>
  <div rdxNumberFieldGroup>
    <button rdxNumberFieldDecrement></button>
    <input rdxNumberFieldInput />
    <button rdxNumberFieldIncrement></button>
  </div>
</div>
```

Add `<input rdxNumberFieldHiddenInput />` only when browser-native numeric constraint validation
(`min` / `max` / `step` / `required`) or autofill is required. Normal named form serialization is
provided by the root, so it does not need an extra input.

## Examples

- [Default](../examples/number-field--default.md)
- [Decimal](../examples/number-field--decimal.md)
- [Percentage](../examples/number-field--percentage.md)
- [Currency](../examples/number-field--currency.md)
- [Scrub Area](../examples/number-field--scrub-area.md)
- [Reactive Forms](../examples/number-field--reactive-forms.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/number-field.json`
- Styling (parts + `data-*`): `references/styling-contract/number-field.json`
