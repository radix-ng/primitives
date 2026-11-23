import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
    RdxProgressIndicatorDirective,
    RdxProgressLabelDirective,
    RdxProgressRootDirective,
    RdxProgressTrackDirective,
    RdxProgressValueDirective
} from '@radix-ng/primitives/progress';

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
        <div class="grid w-60 max-w-full grid-cols-2 gap-y-2" [value]="progress()" rdxProgressRoot>
            <div class="contents">
                <span class="text-foreground text-sm" rdxProgressLabel>Upload progress</span>
                <span class="text-foreground text-end text-sm tabular-nums" rdxProgressValue></span>
            </div>

            <div class="col-span-2 h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800" rdxProgressTrack>
                <div
                    class="bg-primary h-full motion-safe:transition-[width] motion-safe:duration-500"
                    rdxProgressIndicator
                ></div>
            </div>
        </div>
    `
})
export class ProgressLinearComponent {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly progress = signal<(typeof progressSteps)[number]>(progressSteps[0]);

    constructor() {
        let stepIndex = 0;
        const interval = window.setInterval(() => {
            stepIndex = (stepIndex + 1) % progressSteps.length;
            this.progress.set(progressSteps[stepIndex]);
        }, 900);

        this.destroyRef.onDestroy(() => window.clearInterval(interval));
    }
}
