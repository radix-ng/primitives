# Slider — Reactive forms

> One example from the [Slider](../components/slider.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The root implements `ControlValueAccessor`, so it binds directly to
`formControl` / `formControlName` and `[(ngModel)]`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
                    <div class="relative h-1 w-full bg-neutral-200 dark:bg-neutral-800" rdxSliderTrack>
                        <div class="bg-primary h-full" rdxSliderIndicator></div>
                        <div
                            class="border-border bg-background focus-within:ring-ring block size-5 border focus-within:ring-2"
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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
