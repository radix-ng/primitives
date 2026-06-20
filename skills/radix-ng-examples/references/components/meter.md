# Meter

#### A graphical display of a numeric value within a range.

```typescript
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
```

## Features

- ✅ Exposes native meter semantics with `role="meter"` and `aria-valuenow`.
- ✅ Supports custom `min` and `max` ranges.
- ✅ Formats display text with `Intl.NumberFormat`.
- ✅ Provides Label and Value parts for accessible naming and value text.
- ✅ Mirrors value metadata through `data-value`, `data-min`, `data-max`, and `data-percent`.

## Import

```typescript
import {
  RdxMeterRootDirective,
  RdxMeterLabelDirective,
  RdxMeterValueDirective,
  RdxMeterTrackDirective,
  RdxMeterIndicatorDirective
} from '@radix-ng/primitives/meter';
```

## Anatomy

```html
<div rdxMeterRoot [value]="24">
  <span rdxMeterLabel>Storage used</span>
  <div rdxMeterTrack>
    <div rdxMeterIndicator></div>
  </div>
  <span rdxMeterValue></span>
</div>
```

## Examples

### Default

An animated labelled meter with formatted value text.

```typescript
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
```

### Custom range

Use `min`, `max`, and `format` when the measured value is not a simple 0-100 range.

```html
<div
    [value]="value"
    [min]="min"
    [max]="max"
    [format]="format"
    [getAriaValueText]="getAriaValueText"
    [class]="c.root"
    rdxMeterRoot
>
    <div [class]="c.header">
        <span [class]="c.label" rdxMeterLabel>Fuel level</span>
        <span [class]="c.value" rdxMeterValue></span>
    </div>

    <div [class]="c.track" rdxMeterTrack>
        <div [class]="cn(c.indicator, 'w-[44%]')" rdxMeterIndicator></div>
    </div>
</div>
```

### Aria value text

Use `aria-valuetext` when the numeric value needs a more descriptive text alternative.

```html
<div [value]="value" [aria-valuetext]="ariaValueText" [class]="c.root" rdxMeterRoot>
    <div [class]="c.header">
        <span [class]="c.label" rdxMeterLabel>Memory pressure</span>
        <span [class]="c.value" rdxMeterValue></span>
    </div>

    <div [class]="c.track" rdxMeterTrack>
        <div [class]="cn(c.indicator, 'w-[88%]', 'bg-destructive')" rdxMeterIndicator></div>
    </div>
</div>
```

## API Reference

### Root

`RdxMeterRootDirective`

### Label

`RdxMeterLabelDirective`

Gives the meter its accessible name through `aria-labelledby`.

### Value

`RdxMeterValueDirective`

Displays the formatted value text and provides `aria-describedby` text for the meter.

### Track

`RdxMeterTrackDirective`

Contains the visual indicator and mirrors root value attributes.

### Indicator

`RdxMeterIndicatorDirective`

Displays the visual meter fill and exposes `data-percent` for styling.
