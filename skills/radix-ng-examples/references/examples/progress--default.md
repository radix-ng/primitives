# Progress — Default

> One example from the [Progress](../components/progress.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

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
