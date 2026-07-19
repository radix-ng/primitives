# Progress — Circular

> One example from the [Progress](../components/progress.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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
