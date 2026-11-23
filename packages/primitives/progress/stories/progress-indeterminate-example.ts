import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxProgressIndicatorDirective,
    RdxProgressLabelDirective,
    RdxProgressRootDirective,
    RdxProgressTrackDirective,
    RdxProgressValueDirective
} from '@radix-ng/primitives/progress';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-progress-indeterminate-example',
    imports: [
        RdxProgressIndicatorDirective,
        RdxProgressLabelDirective,
        RdxProgressRootDirective,
        RdxProgressTrackDirective,
        RdxProgressValueDirective
    ],
    template: `
        <div class="flex w-80 flex-col gap-2" [value]="null" rdxProgressRoot>
            <div class="flex items-center justify-between gap-4">
                <span class="text-foreground text-sm font-medium" rdxProgressLabel>Preparing upload</span>
                <span class="text-muted-foreground text-sm tabular-nums" rdxProgressValue></span>
            </div>

            <div class="h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800" rdxProgressTrack>
                <div
                    class="bg-primary h-full w-1/3 transition-transform duration-500 ease-out data-[indeterminate]:animate-pulse data-[indeterminate]:rounded-none"
                    rdxProgressIndicator
                ></div>
            </div>
        </div>
    `
})
export class ProgressIndeterminateStory {}
