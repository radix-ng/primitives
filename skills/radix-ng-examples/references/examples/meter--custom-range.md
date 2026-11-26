# Meter — Custom range

> One example from the [Meter](../components/meter.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Use `min`, `max`, and `format` when the measured value is not a simple 0-100 range.

```typescript
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
    selector: 'rdx-meter-custom-range-example',
    imports: [
        RdxMeterIndicatorDirective,
        RdxMeterLabelDirective,
        RdxMeterRootDirective,
        RdxMeterTrackDirective,
        RdxMeterValueDirective
    ],
    template: `
        <div
            class="flex w-80 flex-col gap-2"
            [value]="value"
            [min]="min"
            [max]="max"
            [format]="format"
            [getAriaValueText]="getAriaValueText"
            rdxMeterRoot
        >
            <div class="flex items-center justify-between gap-4">
                <span class="text-foreground text-sm font-medium" rdxMeterLabel>Fuel level</span>
                <span class="text-muted-foreground text-sm tabular-nums" rdxMeterValue></span>
            </div>

            <div class="h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800" rdxMeterTrack>
                <div class="bg-primary" rdxMeterIndicator></div>
            </div>
        </div>
    `
})
export class MeterCustomRangeStory {
    protected readonly value = 72;
    protected readonly min = 50;
    protected readonly max = 100;
    protected readonly format = {
        style: 'unit',
        unit: 'liter',
        unitDisplay: 'short'
    } satisfies Intl.NumberFormatOptions;
    protected readonly getAriaValueText = (formattedValue: string) => `${formattedValue} in the tank`;
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
