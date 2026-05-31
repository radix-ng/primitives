import { Component, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import {
    RdxSliderRangeComponent,
    RdxSliderRootComponent,
    RdxSliderThumbComponent,
    RdxSliderTrackComponent
} from '@radix-ng/primitives/slider';
import { tooltipImports } from '@radix-ng/primitives/tooltip2';

@Component({
    selector: 'tooltip-slider',
    imports: [
        ...tooltipImports,
        RdxSliderRootComponent,
        RdxSliderTrackComponent,
        RdxSliderRangeComponent,
        RdxSliderThumbComponent
    ],
    template: `
        <rdx-slider
            [modelValue]="[45]"
            [step]="5"
            styleClass="relative flex h-5 w-52 touch-none select-none items-center"
        >
            <rdx-slider-track class="bg-muted relative h-1 grow overflow-hidden rounded-full">
                <rdx-slider-range class="bg-primary absolute h-full" />
            </rdx-slider-track>

            <ng-container
                [open]="showTooltipState()"
                delayDuration="0"
                skipDelayDuration="0"
                rdxTooltip
                isControlledState
            >
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring focus-visible:ring-offset-background block size-5 rounded-full border shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    [rdxOnPointerDown]="handlePointerDown"
                    aria-label="Volume"
                    rdxTooltipTrigger
                />

                <ng-container [container]="tooltipContentRef()" rdxTooltipPortal>
                    <ng-template #tooltipContent rdxTooltipPortalPresence>
                        <div sideOffset="8" side="top" updatePositionStrategy="always" rdxTooltipContentWrapper>
                            <div
                                class="border-border bg-popover text-popover-foreground select-none rounded-md border px-3 py-2 text-sm leading-none shadow-md"
                                rdxTooltipContent
                            >
                                Volume
                            </div>
                        </div>
                    </ng-template>
                </ng-container>
            </ng-container>
        </rdx-slider>
    `
})
export class TooltipSlider {
    private readonly ngZone = inject(NgZone);

    readonly tooltipContentRef = viewChild.required<ElementRef<HTMLElement>>('tooltipContent');

    readonly showTooltipState = signal(false);

    handlePointerDown = () => {
        this.showTooltipState.set(true);

        const handlePointerUp = () => {
            this.showTooltipState.set(false);

            document.removeEventListener('pointerup', handlePointerUp);
        };

        this.ngZone.runOutsideAngular(() => {
            document.addEventListener('pointerup', handlePointerUp);
        });

        return;
    };
}
