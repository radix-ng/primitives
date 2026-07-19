# Meter

A graphical display of a numeric value within a range.

> Index — full source of each example is one click away in `../examples/meter--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Exposes native meter semantics with `role="meter"` and `aria-valuenow`.
- ✅ Supports custom `min` and `max` ranges.
- ✅ Formats display text with `Intl.NumberFormat`.
- ✅ Provides Label and Value parts for accessible naming and value text.
- ✅ Mirrors value metadata through `data-value`, `data-min`, `data-max`, and `data-percent`.

## Import

```typescript
import {
  RdxMeterRootDirective,
  RdxMeterLabelDirective,
  RdxMeterValueDirective,
  RdxMeterTrackDirective,
  RdxMeterIndicatorDirective
} from '@radix-ng/primitives/meter';
```

## Anatomy

```html
<div rdxMeterRoot [value]="24">
  <span rdxMeterLabel>Storage used</span>
  <div rdxMeterTrack>
    <div rdxMeterIndicator></div>
  </div>
  <span rdxMeterValue></span>
</div>
```

## Examples

- [Default](../examples/meter--default.md)
- [Custom range](../examples/meter--custom-range.md)
- [Aria value text](../examples/meter--aria-value-text.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/meter.json`
- Styling (parts + `data-*`): `references/styling-contract/meter.json`
