import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

/**
 * Sizes, including a square icon button.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-sizes',
    imports: [RdxButtonDirective, LucidePlus],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxButton>Small</button>
            <button class="demo-button demo-button-primary h-9 px-4" rdxButton>Medium</button>
            <button class="demo-button demo-button-primary h-10 px-6 text-base" rdxButton>Large</button>
            <button class="demo-button demo-button-primary size-9 p-0" rdxButton aria-label="Add">
                <svg class="flex" lucidePlus size="16" />
            </button>
        </div>
    `
})
export class RdxButtonSizesComponent {}
