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
