# Meter — Default

> One example from the [Meter](../components/meter.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

An animated labelled meter with formatted value text.

```typescript
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
            class="grid w-60 max-w-full grid-cols-2 gap-y-2"
            [value]="value()"
            [format]="format"
            [getAriaValueText]="getAriaValueText"
            rdxMeterRoot
        >
            <div class="contents">
                <span class="text-foreground text-sm" rdxMeterLabel>Storage used</span>
                <span class="text-foreground text-end text-sm tabular-nums" rdxMeterValue></span>
            </div>

            <div class="col-span-2 h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800" rdxMeterTrack>
                <div
                    class="bg-primary h-full motion-safe:transition-[width] motion-safe:duration-500"
                    rdxMeterIndicator
                ></div>
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
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
