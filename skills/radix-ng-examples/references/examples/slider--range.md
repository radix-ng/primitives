# Slider — Range

> One example from the [Slider](../components/slider.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Pass an array value and render one `rdxSliderThumb` per value, each with an explicit
`index`. Use `minStepsBetweenValues` to keep the thumbs apart, and
`thumbCollisionBehavior` to control what happens when they meet.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'slider-range-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none" [defaultValue]="[25, 75]" [minStepsBetweenValues]="1" rdxSliderRoot>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="relative h-1 w-full bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                    <div class="bg-primary h-full" rdxSliderIndicator></div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 border focus-within:ring-2"
                        [index]="0"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Minimum" />
                    </div>
                    <div
                        class="border-border bg-background focus-within:ring-ring block size-5 border focus-within:ring-2"
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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
