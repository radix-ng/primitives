# Time Field

A segmented time input that lets users enter a time hour-by-hour with full keyboard control and localization.

> Index — full source of each example is one click away in `../examples/time-field--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Editable, individually focusable segments (hour, minute, second, day period).
- ✅ Full keyboard navigation — arrow keys move between and increment/decrement segments.
- ✅ Controlled or uncontrolled value via the `value` model.
- ✅ 12- and 24-hour cycles with an automatic day-period segment.
- ✅ Configurable `granularity` (`hour` / `minute` / `second`).
- ✅ `minValue` / `maxValue` range validation exposed through `data-invalid`.
- ✅ Locale-aware formatting (segment order, separators, numbering system).
- ✅ Headless and accessible — state is published via `data-*` attributes for you to style.
- ✅ Uses `null` as the empty value for stable Angular Signal Forms fields.

> Time Field is a Radix NG addition — it has no Base UI counterpart — but it follows the same
> headless, signals-first, `data-*`-driven conventions as the rest of the library.

## Import

```ts
import { RdxTimeFieldRootDirective, RdxTimeFieldInputDirective } from '@radix-ng/primitives/time-field';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
```

## Anatomy

Assemble the field from the root, an input segment rendered per `segmentContents()` entry, and an
optional visually-hidden input for native form participation.

```html
<div rdxTimeFieldRoot>
  @for (item of root.segmentContents(); track $index) {
  <div rdxTimeFieldInput [part]="item.part">{{ item.value }}</div>
  }
  <input rdxVisuallyHiddenInput feature="focusable" />
</div>
```

## Examples

- [Default](../examples/time-field--default.md)
- [Hour cycle](../examples/time-field--hour-cycle.md)
- [Granularity](../examples/time-field--granularity.md)
- [Disabled](../examples/time-field--disabled.md)
- [Readonly](../examples/time-field--readonly.md)
- [Validation](../examples/time-field--validation.md)
- [Localization](../examples/time-field--localization.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/time-field.json`
- Styling (parts + `data-*`): `references/styling-contract/time-field.json`
