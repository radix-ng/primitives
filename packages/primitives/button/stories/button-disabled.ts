import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

/**
 * Disabled handling. The first button uses the native `disabled` attribute
 * (removed from the tab order). The second sets `focusableWhenDisabled`, so it
 * stays focusable via `aria-disabled` while its activation is suppressed.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-disabled',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button class="demo-button demo-button-primary h-9 px-4" rdxButton disabled>Disabled</button>
            <button class="demo-button demo-button-outline h-9 px-4" rdxButton disabled focusableWhenDisabled>
                Disabled (focusable)
            </button>
        </div>
    `
})
export class RdxButtonDisabledComponent {}
