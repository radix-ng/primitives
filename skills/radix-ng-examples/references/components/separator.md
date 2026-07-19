# Separator

A separator element accessible to screen readers.

> Index — full source of each example is one click away in `../examples/separator--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Supports horizontal and vertical orientations.
- ✅ Exposes orientation state via the `data-orientation` attribute.
- ✅ Uses the `separator` role and sets `aria-orientation` for both orientations.

## Import

```typescript
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';
```

## Anatomy

Separator is a single directive. Apply `rdxSeparatorRoot` to the element that separates content.

```html
<div rdxSeparatorRoot></div>
```

## Examples

- [Vertical](../examples/separator--vertical.md)
- [Horizontal](../examples/separator--horizontal.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/separator.json`
- Styling (parts + `data-*`): `references/styling-contract/separator.json`
