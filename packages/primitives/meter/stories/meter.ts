import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { cn } from '../../storybook/styles';
import { RdxMeterIndicatorDirective } from '../src/meter-indicator.directive';
import { RdxMeterLabelDirective } from '../src/meter-label.directive';
import { RdxMeterRootDirective } from '../src/meter-root.directive';
import { RdxMeterTrackDirective } from '../src/meter-track.directive';
import { RdxMeterValueDirective } from '../src/meter-value.directive';

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
                <div [class]="indicatorClass()" rdxMeterIndicator></div>
            </div>
        </div>
    `
})
export class MeterStorageComponent {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly value = signal<(typeof storageSteps)[number]>(storageSteps[0]);
    protected readonly format: Intl.NumberFormatOptions = { style: 'unit', unit: 'gigabyte', unitDisplay: 'short' };
    protected readonly getAriaValueText = (formattedValue: string) => `${formattedValue} of storage used`;

    protected readonly indicatorClass = computed(() =>
        cn('h-full rounded-full bg-primary transition-all duration-700 ease-out', this.widthClass())
    );

    private readonly widthClass = computed(() => {
        switch (this.value()) {
            case 24:
                return 'w-[24%]';
            case 38:
                return 'w-[38%]';
            case 52:
                return 'w-[52%]';
            case 67:
                return 'w-[67%]';
            case 81:
                return 'w-[81%]';
        }
    });

    constructor() {
        let stepIndex = 0;
        const interval = window.setInterval(() => {
            stepIndex = (stepIndex + 1) % storageSteps.length;
            this.value.set(storageSteps[stepIndex]);
        }, 1200);

        this.destroyRef.onDestroy(() => window.clearInterval(interval));
    }
}
