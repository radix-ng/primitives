# Slider — Marks

> One example from the [Slider](../components/slider.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Place tick marks and labels at percentages of the value range. Use `step` to snap the thumb
to regularly spaced marks.

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'slider-marks-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="relative w-56 select-none" [defaultValue]="40" [min]="min" [max]="max" rdxSliderRoot>
            <div class="flex w-full touch-none items-center py-3" rdxSliderControl>
                <div class="relative h-1 w-full bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                    <div class="bg-primary h-full" rdxSliderIndicator></div>
                    @for (mark of marks; track mark.value) {
                        <span
                            class="bg-foreground pointer-events-none absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
                            [style.inset-inline-start.%]="mark.percent"
                            aria-hidden="true"
                        ></span>
                    }
                    <div
                        class="border-foreground bg-background has-focus-visible:outline-ring block size-4 border has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
                        rdxSliderThumb
                    >
                        <input rdxSliderThumbInput aria-label="Volume" />
                    </div>
                </div>
            </div>
            <div class="relative h-4" aria-hidden="true">
                @for (mark of marks; track mark.value) {
                    <span
                        class="text-muted-foreground absolute -translate-x-1/2 text-xs whitespace-nowrap rtl:translate-x-1/2"
                        [style.inset-inline-start.%]="mark.percent"
                    >
                        {{ mark.value }}
                    </span>
                }
            </div>
        </div>
    `
})
export class SliderMarksExample {
    protected readonly min = 0;
    protected readonly max = 100;
    protected readonly marks = [0, 25, 50, 75, 100].map((value) => ({
        value,
        percent: ((value - this.min) / (this.max - this.min)) * 100
    }));
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
