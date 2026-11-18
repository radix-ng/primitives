import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

/**
 * Shared button variants applied on top of the headless `rdxButton` directive.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-variants',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button class="demo-button demo-button-primary h-9 px-4" rdxButton>Primary</button>
            <button class="demo-button demo-button-secondary h-9 px-4" rdxButton>Secondary</button>
            <button class="demo-button demo-button-outline h-9 px-4" rdxButton>Outline</button>
            <button class="demo-button demo-button-ghost h-9 px-4" rdxButton>Ghost</button>
            <button class="demo-button demo-button-destructive h-9 px-4" rdxButton>Destructive</button>
        </div>
    `
})
export class RdxButtonVariantsComponent {}
