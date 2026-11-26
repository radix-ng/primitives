# Slider — Value

> One example from the [Slider](../components/slider.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Display the formatted value with `rdxSliderValue`. Formatting honours the root's
`format` (`Intl.NumberFormatOptions`) and `locale`. The output automatically
sets its `for` attribute to the registered thumb input ids, in DOM order.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderLabel,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    RdxSliderValue
} from '@radix-ng/primitives/slider';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'slider-value-example',
    imports: [
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderLabel,
        RdxSliderThumb,
        RdxSliderThumbInput,
        RdxSliderValue
    ],
    template: `
        <div class="relative w-56 select-none" [defaultValue]="42" [format]="format" rdxSliderRoot>
            <div class="text-foreground mb-2 flex items-center justify-between text-sm">
                <div rdxSliderLabel>Budget</div>
                <output class="text-muted-foreground tabular-nums" rdxSliderValue></output>
            </div>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="relative h-1 w-full bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                    <div class="bg-primary h-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 border focus-within:ring-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput />
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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
