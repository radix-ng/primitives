# Progress

Displays task completion with accessible label, value, track, and indicator parts.

> Index — full source of each example is one click away in `../examples/progress--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Supports determinate and indeterminate progress.
- ✅ Supports custom `min` and `max` ranges.
- ✅ Provides Label and Value parts for accessible naming and value text.
- ✅ Exposes state through boolean `data-complete`, `data-progressing`, and `data-indeterminate` attributes.

## Import

```typescript
import {
  RdxProgressRootDirective,
  RdxProgressLabelDirective,
  RdxProgressValueDirective,
  RdxProgressTrackDirective,
  RdxProgressIndicatorDirective
} from '@radix-ng/primitives/progress';
```

## Anatomy

```html
<div rdxProgressRoot [value]="70">
  <span rdxProgressLabel>Upload progress</span>
  <span rdxProgressValue></span>
  <div rdxProgressTrack>
    <div rdxProgressIndicator></div>
  </div>
</div>
```

## Examples

- [Default](../examples/progress--default.md)
- [Indeterminate](../examples/progress--indeterminate.md)
- [Custom range](../examples/progress--custom-range.md)
- [Circular](../examples/progress--circular.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/progress.json`
- Styling (parts + `data-*`): `references/styling-contract/progress.json`
