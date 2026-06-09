# Slider

#### An input where the user selects a value, or a range of values, from within a given range.

```typescript
import { Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'slider-default-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none" [value]="45" [step]="5" rdxSliderRoot>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderDefaultExample {}
```

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Single value or multiple thumbs for a range.
- ✅ Configurable thumb collision behavior (`push`, `swap`, `none`).
- ✅ Minimum distance between thumbs.
- ✅ Press or drag anywhere on the control to update the value.
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

### Range

Pass an array value and render one `rdxSliderThumb` per value, each with an explicit
`index`. Use `minStepsBetweenValues` to keep the thumbs apart, and
`thumbCollisionBehavior` to control what happens when they meet.

```typescript
import { Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'slider-range-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none" [value]="[25, 75]" [minStepsBetweenValues]="1" rdxSliderRoot>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                        [index]="0"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Minimum" />
                    </div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                        [index]="1"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Maximum" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderRangeExample {}
```

### Vertical

Set `orientation="vertical"` on the root. The control and track lay out along the
vertical axis; no other changes are required.

```typescript
import { Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'slider-vertical-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative h-56 w-5 select-none" [value]="45" [step]="5" rdxSliderRoot orientation="vertical">
            <div class="flex h-full w-5 touch-none justify-center" rdxSliderControl>
                <div class="bg-muted relative h-full w-1 rounded-full" rdxSliderTrack>
                    <div class="bg-primary w-full rounded-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderVerticalExample {}
```

### Value

Display the formatted value with `rdxSliderValue`. Formatting honours the root's
`format` (`Intl.NumberFormatOptions`) and `locale`.

```typescript
import { Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    RdxSliderValue
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'slider-value-example',
    imports: [
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput,
        RdxSliderValue
    ],
    template: `
        <div class="relative w-56 select-none" [value]="42" [format]="format" rdxSliderRoot>
            <div class="text-foreground mb-2 flex items-center justify-between text-sm">
                <span id="slider-value-label">Budget</span>
                <output class="text-muted-foreground tabular-nums" rdxSliderValue></output>
            </div>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-labelledby="slider-value-label" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderValueExample {
    readonly format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 };
}
```

### Disabled

```typescript
import { Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'slider-disabled-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none data-[disabled]:opacity-50" [value]="45" rdxSliderRoot disabled>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                    <div class="border-border bg-background block size-5 rounded-full border shadow-sm" rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderDisabledExample {}
```

### Reactive forms

The root composes a `ControlValueAccessor`, so it binds directly to
`formControl` / `formControlName` and `[(ngModel)]`.

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'slider-forms-example',
    imports: [
        ReactiveFormsModule,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div class="flex flex-col gap-3">
            <label class="text-foreground text-sm" id="volume-label">Volume</label>
            <div class="relative w-56 select-none" [formControl]="volume" [step]="5" rdxSliderRoot>
                <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                    <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                        <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                        <div
                            class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                            rdxSliderThumb
                        >
                            <input rdxSliderThumbInput aria-labelledby="volume-label" />
                        </div>
                    </div>
                </div>
            </div>
            <p class="text-muted-foreground text-sm tabular-nums">Value: {{ volume.value }}</p>
        </div>
    `
})
export class SliderFormsExample {
    readonly volume = new FormControl<number>(30);
}
```

## API Reference

### Root

`RdxSliderRoot` — groups the parts and owns the value, state and thumb registration.

| Data attribute       | Value                          |
| -------------------- | ------------------------------ |
| `[data-orientation]` | `"horizontal" \| "vertical"`   |
| `[data-disabled]`    | Present when disabled.         |
| `[data-dragging]`    | Present while a thumb is dragged. |

### Control

`RdxSliderControl` — the interactive area; reads everything from context, no inputs.

| Data attribute       | Value                          |
| -------------------- | ------------------------------ |
| `[data-orientation]` | `"horizontal" \| "vertical"`   |
| `[data-disabled]`    | Present when disabled.         |
| `[data-dragging]`    | Present while a thumb is dragged. |

### Track

`RdxSliderTrack` — the rail; reads everything from context, no inputs.

| Data attribute       | Value                          |
| -------------------- | ------------------------------ |
| `[data-orientation]` | `"horizontal" \| "vertical"`   |
| `[data-disabled]`    | Present when disabled.         |
| `[data-dragging]`    | Present while a thumb is dragged. |

### Indicator

`RdxSliderIndicator` — the filled range; reads everything from context, no inputs.

| Data attribute       | Value                          |
| -------------------- | ------------------------------ |
| `[data-orientation]` | `"horizontal" \| "vertical"`   |
| `[data-disabled]`    | Present when disabled.         |
| `[data-dragging]`    | Present while a thumb is dragged. |

### Thumb

`RdxSliderThumb` — a draggable handle; wrap an `input[rdxSliderThumbInput]` inside it.

| Data attribute       | Value                          |
| -------------------- | ------------------------------ |
| `[data-index]`       | Numeric index of the thumb.    |
| `[data-orientation]` | `"horizontal" \| "vertical"`   |
| `[data-disabled]`    | Present when the thumb is disabled. |
| `[data-dragging]`    | Present while a thumb is dragged. |

### Thumb Input

`RdxSliderThumbInput` — the nested native `input[type=range]` that drives keyboard, a11y and forms.

| Data attribute | Value                       |
| -------------- | --------------------------- |
| `[data-index]` | Numeric index of the thumb. |

### Value

`RdxSliderValue` — displays the formatted value(s).

## Accessibility

Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb).
