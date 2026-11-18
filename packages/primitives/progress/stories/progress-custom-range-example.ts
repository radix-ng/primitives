import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxProgressIndicatorDirective,
    RdxProgressLabelDirective,
    RdxProgressRootDirective,
    RdxProgressTrackDirective,
    RdxProgressValueDirective
} from '@radix-ng/primitives/progress';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-progress-custom-range-example',
    imports: [
        RdxProgressIndicatorDirective,
        RdxProgressLabelDirective,
        RdxProgressRootDirective,
        RdxProgressTrackDirective,
        RdxProgressValueDirective
    ],
    template: `
        <div
            class="flex w-80 flex-col gap-2"
            [value]="value"
            [min]="min"
            [max]="max"
            [valueLabel]="valueLabel"
            rdxProgressRoot
        >
            <div class="flex items-center justify-between gap-4">
                <span class="text-foreground text-sm font-medium" rdxProgressLabel>Transfer</span>
                <span class="text-muted-foreground text-sm tabular-nums" rdxProgressValue></span>
            </div>

            <div class="bg-muted h-3 overflow-hidden rounded-full" rdxProgressTrack>
                <div
                    class="bg-primary h-full w-1/2 rounded-full transition-transform duration-500 ease-out data-[indeterminate]:animate-pulse data-[indeterminate]:rounded-none"
                    rdxProgressIndicator
                ></div>
            </div>
        </div>
    `
})
export class ProgressCustomRangeStory {
    protected readonly value = 750;
    protected readonly min = 500;
    protected readonly max = 1000;
    protected readonly valueLabel = (value: number, min: number, max: number) => `${value - min} of ${max - min} MB`;
}
