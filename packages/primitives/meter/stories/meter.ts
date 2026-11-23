import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
    RdxMeterIndicatorDirective,
    RdxMeterLabelDirective,
    RdxMeterRootDirective,
    RdxMeterTrackDirective,
    RdxMeterValueDirective
} from '@radix-ng/primitives/meter';

const storageSteps = [24, 38, 52, 67, 81] as const;

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'meter-storage',
    imports: [
        RdxMeterRootDirective,
        RdxMeterLabelDirective,
        RdxMeterValueDirective,
        RdxMeterTrackDirective,
        RdxMeterIndicatorDirective
    ],
    template: `
        <div
            class="flex w-80 flex-col gap-2"
            [value]="value()"
            [format]="format"
            [getAriaValueText]="getAriaValueText"
            rdxMeterRoot
        >
            <div class="flex items-center justify-between gap-4">
                <span class="text-foreground text-sm font-medium" rdxMeterLabel>Storage used</span>
                <span class="text-muted-foreground text-sm tabular-nums" rdxMeterValue></span>
            </div>

            <div class="bg-muted h-3 overflow-hidden rounded-full" rdxMeterTrack>
                <div class="bg-primary rounded-full transition-[width] duration-700 ease-out" rdxMeterIndicator></div>
            </div>
        </div>
    `
})
export class MeterStorageComponent {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly value = signal<(typeof storageSteps)[number]>(storageSteps[0]);
    protected readonly format: Intl.NumberFormatOptions = { style: 'unit', unit: 'gigabyte', unitDisplay: 'short' };
    protected readonly getAriaValueText = (formattedValue: string) => `${formattedValue} of storage used`;

    constructor() {
        afterNextRender(() => {
            let stepIndex = 0;
            const interval = window.setInterval(() => {
                stepIndex = (stepIndex + 1) % storageSteps.length;
                this.value.set(storageSteps[stepIndex]);
            }, 1200);
            this.destroyRef.onDestroy(() => window.clearInterval(interval));
        });
    }
}
