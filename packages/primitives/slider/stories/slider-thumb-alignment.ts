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
    selector: 'slider-thumb-alignment-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="grid w-72 gap-6">
            <div class="grid gap-2">
                <span class="text-foreground text-sm font-medium">Center</span>
                <div class="relative px-2 select-none" thumbAlignment="center" rdxSliderRoot [value]="50">
                    <div class="flex h-6 w-full touch-none items-center" rdxSliderControl>
                        <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                            <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                            <div
                                class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                                rdxSliderThumb
                            >
                                <input rdxSliderThumbInput aria-label="Centered thumb value" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid gap-2">
                <span class="text-foreground text-sm font-medium">Edge</span>
                <div class="relative px-2 select-none" thumbAlignment="edge" rdxSliderRoot [value]="50">
                    <div class="flex h-6 w-full touch-none items-center" rdxSliderControl>
                        <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                            <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                            <div
                                class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                                rdxSliderThumb
                            >
                                <input rdxSliderThumbInput aria-label="Edge aligned thumb value" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid gap-2">
                <span class="text-foreground text-sm font-medium">Edge client only</span>
                <div class="relative px-2 select-none" thumbAlignment="edge-client-only" rdxSliderRoot [value]="50">
                    <div class="flex h-6 w-full touch-none items-center" rdxSliderControl>
                        <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                            <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                            <div
                                class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                                rdxSliderThumb
                            >
                                <input rdxSliderThumbInput aria-label="Client-only edge aligned thumb value" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SliderThumbAlignmentExample {}
