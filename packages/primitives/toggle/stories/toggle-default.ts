import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHeart } from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-default-example',
    imports: [RdxToggle, LucideHeart],
    template: `
        <button
            class="demo-button demo-button-ghost group size-8 active:bg-neutral-200 dark:active:bg-neutral-700"
            rdxToggle
            aria-label="Favorite"
        >
            <svg class="group-data-pressed:fill-current" lucideHeart size="16" aria-hidden="true"></svg>
        </button>
    `
})
export class ToggleDefaultExample {}
