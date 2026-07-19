# Slider

An input where the user selects a value, or a range of values, from within a given range.

> Index — full source of each example is one click away in `../examples/slider--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Single value or multiple thumbs for a range.
- ✅ Configurable thumb collision behavior (`push`, `swap`, `none`).
- ✅ Minimum distance between thumbs.
- ✅ Press or drag anywhere on the control to update the value.
- ✅ Thumb alignment modes: `center`, `edge`, and `edge-client-only`.
- ✅ Horizontal and vertical orientation, with RTL support.
- ✅ Value formatting with `Intl.NumberFormat`.
- ✅ Full keyboard navigation, including large steps.
- ✅ Works with Angular forms via a hidden native range input per thumb.

## Import

```ts
import {
    RdxSliderRoot,
    RdxSliderControl,
    RdxSliderTrack,
    RdxSliderIndicator,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderValue
} from '@radix-ng/primitives/slider';
```

Or import the whole module:

```ts
import { RdxSliderModule } from '@radix-ng/primitives/slider';
```

## Anatomy

The slider is assembled from directive-based parts — there are no separate
horizontal/vertical components. The same parts drive both orientations, switched
through the `orientation` input on the root.

```html
<div rdxSliderRoot>
    <output rdxSliderValue></output>
    <div rdxSliderControl>
        <div rdxSliderTrack>
            <div rdxSliderIndicator></div>
            <div rdxSliderThumb>
                <input rdxSliderThumbInput />
            </div>
        </div>
    </div>
</div>
```

Each thumb owns a nested `input[rdxSliderThumbInput]`. It is visually hidden but
remains the focusable element that powers keyboard interaction, accessibility and
form submission.

## Examples

- [Range](../examples/slider--range.md)
- [Vertical](../examples/slider--vertical.md)
- [Value](../examples/slider--value.md)
- [Disabled](../examples/slider--disabled.md)
- [Reactive forms](../examples/slider--reactive-forms.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/slider.json`
- Styling (parts + `data-*`): `references/styling-contract/slider.json`
