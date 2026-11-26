# Slider — Reactive forms

> One example from the [Slider](../components/slider.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

The root implements `ControlValueAccessor`, so it binds directly to
`formControl` / `formControlName` and `[(ngModel)]`.

Inside a Field, Slider inherits the Field's `name` and disabled state, including disabled Fieldsets.
Field labels name the group, and Field descriptions and visible errors describe the native thumbs.
Give each thumb its own accessible name in a range. Use `rdxNgControlField` to display Reactive
Forms validation through the Field. Focus can move between thumbs without triggering blur
validation. The field is marked touched when focus leaves the slider.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
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
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div class="flex flex-col gap-3" rdxFieldRoot name="volume">
            <div class="text-foreground text-sm" rdxFieldLabel>Volume</div>
            <div class="relative w-56 select-none" [formControl]="volume" [step]="5" rdxNgControlField rdxSliderRoot>
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
            <p class="text-muted-foreground text-sm tabular-nums" rdxFieldDescription>
                Value {{ volume.value }}. Choose 20 or higher.
            </p>
            <p class="text-destructive text-sm" rdxFieldError match="min">Volume must be at least 20.</p>
        </div>
    `
})
export class SliderFormsExample {
    readonly volume = new FormControl(30, { nonNullable: true, validators: Validators.min(20) });
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
