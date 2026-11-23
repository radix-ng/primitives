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

            <div class="h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800" rdxMeterTrack>
                <div class="bg-destructive" rdxMeterIndicator></div>
            </div>
        </div>
    `
})
export class MeterAriaValueTextStory {
    protected readonly value = 88;
    protected readonly ariaValueText = 'Memory pressure is high';
}
