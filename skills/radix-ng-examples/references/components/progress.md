# Progress

#### Displays task completion with accessible label, value, track, and indicator parts.

```typescript
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { cn } from '../../storybook/styles';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressLabelDirective } from '../src/progress-label.directive';
import { RdxProgressRootDirective } from '../src/progress-root.directive';
import { RdxProgressTrackDirective } from '../src/progress-track.directive';
import { RdxProgressValueDirective } from '../src/progress-value.directive';

const progressSteps = [12, 28, 44, 60, 76, 92, 100] as const;

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'progress-linear',
    imports: [
        RdxProgressRootDirective,
        RdxProgressLabelDirective,
        RdxProgressValueDirective,
        RdxProgressTrackDirective,
        RdxProgressIndicatorDirective
    ],
    template: `
        <div class="flex w-80 flex-col gap-2" [value]="progress()" rdxProgressRoot>
            <div class="flex items-center justify-between gap-4">
                <span class="text-foreground text-sm font-medium" rdxProgressLabel>Upload progress</span>
                <span class="text-muted-foreground text-sm tabular-nums" rdxProgressValue></span>
            </div>

            <div class="bg-muted h-3 overflow-hidden rounded-full" rdxProgressTrack>
                <div [class]="indicatorClass()" rdxProgressIndicator></div>
            </div>
        </div>
    `
})
export class ProgressLinearComponent {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly progress = signal<(typeof progressSteps)[number]>(progressSteps[0]);

    protected readonly indicatorClass = computed(() =>
        cn(
            'h-full rounded-full bg-primary transition-all duration-700 ease-out',
            this.widthClass(),
            this.progress() === 100 && 'bg-primary/80'
        )
    );

    private readonly widthClass = computed(() => {
        switch (this.progress()) {
            case 12:
                return 'w-[12%]';
            case 28:
                return 'w-[28%]';
            case 44:
                return 'w-[44%]';
            case 60:
                return 'w-[60%]';
            case 76:
                return 'w-[76%]';
            case 92:
                return 'w-[92%]';
            case 100:
                return 'w-full';
        }
    });

    constructor() {
        let stepIndex = 0;
        const interval = window.setInterval(() => {
            stepIndex = (stepIndex + 1) % progressSteps.length;
            this.progress.set(progressSteps[stepIndex]);
        }, 900);

        this.destroyRef.onDestroy(() => window.clearInterval(interval));
    }
}
```

## Features

- ✅ Supports determinate and indeterminate progress.
- ✅ Supports custom `min` and `max` ranges.
- ✅ Provides Label and Value parts for accessible naming and value text.
- ✅ Exposes state through `data-state`, `data-complete`, `data-progressing`, and `data-indeterminate`.

## Import

```typescript
import {
  RdxProgressRootDirective,
  RdxProgressLabelDirective,
  RdxProgressValueDirective,
  RdxProgressTrackDirective,
  RdxProgressIndicatorDirective
} from '@radix-ng/primitives/progress';
```

## Anatomy

```html
<div rdxProgressRoot [value]="70">
  <span rdxProgressLabel>Upload progress</span>
  <span rdxProgressValue></span>
  <div rdxProgressTrack>
    <div rdxProgressIndicator></div>
  </div>
</div>
```

## Examples

### Default

An animated labelled progress bar with formatted value text.

```typescript
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { cn } from '../../storybook/styles';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressLabelDirective } from '../src/progress-label.directive';
import { RdxProgressRootDirective } from '../src/progress-root.directive';
import { RdxProgressTrackDirective } from '../src/progress-track.directive';
import { RdxProgressValueDirective } from '../src/progress-value.directive';

const progressSteps = [12, 28, 44, 60, 76, 92, 100] as const;

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'progress-linear',
    imports: [
        RdxProgressRootDirective,
        RdxProgressLabelDirective,
        RdxProgressValueDirective,
        RdxProgressTrackDirective,
        RdxProgressIndicatorDirective
    ],
    template: `
        <div class="flex w-80 flex-col gap-2" [value]="progress()" rdxProgressRoot>
            <div class="flex items-center justify-between gap-4">
                <span class="text-foreground text-sm font-medium" rdxProgressLabel>Upload progress</span>
                <span class="text-muted-foreground text-sm tabular-nums" rdxProgressValue></span>
            </div>

            <div class="bg-muted h-3 overflow-hidden rounded-full" rdxProgressTrack>
                <div [class]="indicatorClass()" rdxProgressIndicator></div>
            </div>
        </div>
    `
})
export class ProgressLinearComponent {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly progress = signal<(typeof progressSteps)[number]>(progressSteps[0]);

    protected readonly indicatorClass = computed(() =>
        cn(
            'h-full rounded-full bg-primary transition-all duration-700 ease-out',
            this.widthClass(),
            this.progress() === 100 && 'bg-primary/80'
        )
    );

    private readonly widthClass = computed(() => {
        switch (this.progress()) {
            case 12:
                return 'w-[12%]';
            case 28:
                return 'w-[28%]';
            case 44:
                return 'w-[44%]';
            case 60:
                return 'w-[60%]';
            case 76:
                return 'w-[76%]';
            case 92:
                return 'w-[92%]';
            case 100:
                return 'w-full';
        }
    });

    constructor() {
        let stepIndex = 0;
        const interval = window.setInterval(() => {
            stepIndex = (stepIndex + 1) % progressSteps.length;
            this.progress.set(progressSteps[stepIndex]);
        }, 900);

        this.destroyRef.onDestroy(() => window.clearInterval(interval));
    }
}
```

### Indeterminate

Use `null` when progress is active but the current value is unknown.

```html
<div [value]="null" [class]="c.root" rdxProgressRoot>
    <div [class]="c.header">
        <span [class]="c.label" rdxProgressLabel>Preparing upload</span>
        <span [class]="c.value" rdxProgressValue></span>
    </div>

    <div [class]="c.track" rdxProgressTrack>
        <div [class]="cn(c.indicator, 'w-1/3')" rdxProgressIndicator></div>
    </div>
</div>
```

### Custom range

Use `min`, `max`, and `valueLabel` when progress is not a simple 0-100 percentage.

```html
<div [value]="value" [min]="min" [max]="max" [valueLabel]="valueLabel" [class]="c.root" rdxProgressRoot>
    <div [class]="c.header">
        <span [class]="c.label" rdxProgressLabel>Transfer</span>
        <span [class]="c.value" rdxProgressValue></span>
    </div>

    <div [class]="c.track" rdxProgressTrack>
        <div [class]="cn(c.indicator, 'w-1/2')" rdxProgressIndicator></div>
    </div>
</div>
```

### Circular

The same primitive state can drive an SVG circular progress indicator.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressLabelDirective } from '../src/progress-label.directive';
import { RdxProgressRootDirective } from '../src/progress-root.directive';
import { RdxProgressTrackDirective } from '../src/progress-track.directive';
import { RdxProgressValueDirective } from '../src/progress-value.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'progress-circular',
    imports: [
        RdxProgressRootDirective,
        RdxProgressLabelDirective,
        RdxProgressValueDirective,
        RdxProgressTrackDirective,
        RdxProgressIndicatorDirective
    ],
    template: `
        <div class="relative grid size-40 place-items-center" [value]="progress()" rdxProgressRoot>
            <span class="sr-only" rdxProgressLabel>Storage used</span>

            <svg class="size-full -rotate-90" viewBox="0 0 100 100" rdxProgressTrack>
                <circle class="stroke-muted fill-none" cx="50" cy="50" r="44" stroke-width="8" />
                <circle
                    class="stroke-primary fill-none transition-all duration-500 ease-out"
                    [attr.stroke-dasharray]="dashArray()"
                    cx="50"
                    cy="50"
                    r="44"
                    stroke-linecap="round"
                    stroke-width="8"
                    rdxProgressIndicator
                />
            </svg>

            <span class="text-foreground absolute text-lg font-semibold" rdxProgressValue></span>
        </div>
    `
})
export class ProgressCircularComponent {
    private readonly radius = 44;
    private readonly circumference = 2 * Math.PI * this.radius;

    protected readonly progress = signal(72);
    protected readonly dashArray = computed(
        () => `${(this.progress() / 100) * this.circumference} ${this.circumference}`
    );
}
```

## API Reference

### Root

`RdxProgressRootDirective`

### Label

`RdxProgressLabelDirective`

Gives the progressbar its accessible name through `aria-labelledby`.

### Value

`RdxProgressValueDirective`

Displays the formatted value text and provides `aria-describedby` text for the progressbar.

### Track

`RdxProgressTrackDirective`

Contains the visual indicator and mirrors root state attributes.

### Indicator

`RdxProgressIndicatorDirective`

Displays the visual progress fill and exposes `data-percent` for styling determinate progress.

## Accessibility

The root uses `role="progressbar"`, is labelled by `rdxProgressLabel`, and is described by
`rdxProgressValue`. In indeterminate state, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and
`aria-valuetext` are omitted because the current value is unknown.
