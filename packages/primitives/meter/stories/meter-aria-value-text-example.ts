import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxMeterIndicatorDirective,
    RdxMeterLabelDirective,
    RdxMeterRootDirective,
    RdxMeterTrackDirective,
    RdxMeterValueDirective
} from '@radix-ng/primitives/meter';
@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-meter-aria-value-text-example',
    imports: [
        RdxMeterIndicatorDirective,
        RdxMeterLabelDirective,
        RdxMeterRootDirective,
        RdxMeterTrackDirective,
        RdxMeterValueDirective
    ],
    template: `
        <div class="flex w-80 flex-col gap-2" [value]="value" [aria-valuetext]="ariaValueText" rdxMeterRoot>
            <div class="flex items-center justify-between gap-4">
                <span class="text-foreground text-sm font-medium" rdxMeterLabel>Memory pressure</span>
                <span class="text-muted-foreground text-sm tabular-nums" rdxMeterValue></span>
            </div>

            <div class="bg-muted h-3 overflow-hidden rounded-full" rdxMeterTrack>
                <div
                    class="bg-primary bg-destructive h-full w-[88%] rounded-full transition-all duration-500 ease-out"
                    rdxMeterIndicator
                ></div>
            </div>
        </div>
    `
})
export class MeterAriaValueTextStory {
    protected readonly value = 88;
    protected readonly ariaValueText = 'Memory pressure is high';
}
