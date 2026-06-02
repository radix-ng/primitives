import { Component, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import {
    RdxSliderRangeComponent,
    RdxSliderRootComponent,
    RdxSliderThumbComponent,
    RdxSliderTrackComponent
} from '@radix-ng/primitives/slider';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

@Component({
    selector: 'rdx-tooltip-slider',
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

            <ng-container [open]="showTooltipState()" rdxTooltip disabled>
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring focus-visible:ring-offset-background block size-5 rounded-full border shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    [rdxOnPointerDown]="handlePointerDown"
                    aria-label="Volume"
                    rdxTooltipTrigger
                />

                <ng-container [container]="tooltipContentRef()" rdxTooltipPortal>
                    <ng-template #tooltipContent rdxTooltipPortalPresence>
                        <div
                            [class]="t.positioner"
                            sideOffset="8"
                            side="top"
                            updatePositionStrategy="always"
                            rdxTooltipPositioner
                        >
                            <div [class]="t.popup" rdxTooltipPopup>Volume</div>
                        </div>
                    </ng-template>
                </ng-container>
            </ng-container>
        </rdx-slider>
    `
})
export class RdxTooltipSliderComponent {
    private readonly ngZone = inject(NgZone);

    protected readonly t = demoTooltip;

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
