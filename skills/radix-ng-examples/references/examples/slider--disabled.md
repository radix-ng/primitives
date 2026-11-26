# Slider — Disabled

> One example from the [Slider](../components/slider.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

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
    selector: 'slider-disabled-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none data-[disabled]:opacity-50" [defaultValue]="45" rdxSliderRoot disabled>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="relative h-1 w-full bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                    <div class="bg-primary h-full" rdxSliderIndicator></div>
                    <div class="border-border bg-background block size-5 border" rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="Value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderDisabledExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
