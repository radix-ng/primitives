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
        <rdx-slider [modelValue]="[45]" [step]="5" styleClass="SliderRoot">
            <rdx-slider-track class="SliderTrack">
                <rdx-slider-range class="SliderRange" />
            </rdx-slider-track>

            <ng-container
                [open]="showTooltipState()"
                delayDuration="0"
                skipDelayDuration="0"
                rdxTooltip
                isControlledState
            >
                <rdx-slider-thumb class="SliderThumb" [rdxOnPointerDown]="handlePointerDown" rdxTooltipTrigger />

                <ng-container [container]="tooltipContentRef()" rdxTooltipPortal>
                    <ng-template #tooltipContent rdxTooltipPortalPresence>
                        <div
                            class="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                            sideOffset="8"
                            side="top"
                            rdxTooltipContentWrapper
                        >
                            <div rdxTooltipContent>Add to library</div>
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
