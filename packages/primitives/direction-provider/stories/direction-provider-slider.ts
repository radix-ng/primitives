import { Component, signal } from '@angular/core';
import { Direction } from '@radix-ng/primitives/core';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    selector: 'direction-provider-slider-example',
    imports: [
        RdxDirectionProvider,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div class="grid w-[520px] max-w-full gap-6 sm:grid-cols-2">
            @for (item of directions; track item.direction) {
                <section
                    class="border-border bg-card text-card-foreground grid gap-4 rounded-md border p-4 shadow-sm"
                    [attr.dir]="item.direction"
                    [direction]="item.direction"
                    rdxDirectionProvider
                >
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span class="text-muted-foreground text-xs tabular-nums">{{ item.value() }}</span>
                    </div>

                    <div
                        class="relative w-full select-none"
                        [(value)]="item.value"
                        [min]="0"
                        [max]="100"
                        [step]="5"
                        rdxSliderRoot
                    >
                        <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                            <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                                <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                                <div
                                    class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                                    rdxSliderThumb
                                >
                                    <input [attr.aria-label]="item.label" rdxSliderThumbInput />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </div>
    `
})
export class DirectionProviderSliderExample {
    protected readonly directions: Array<{
        direction: Direction;
        label: string;
        value: ReturnType<typeof signal<number>>;
    }> = [
        { direction: 'ltr', label: 'Left to right', value: signal(65) },
        { direction: 'rtl', label: 'Right to left', value: signal(65) }
    ];
}
