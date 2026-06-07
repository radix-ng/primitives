import { Component } from '@angular/core';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

/**
 * Disabled handling. The first button uses the native `disabled` attribute
 * (removed from the tab order). The second sets `focusableWhenDisabled`, so it
 * stays focusable via `aria-disabled` while its activation is suppressed.
 */
@Component({
    selector: 'rdx-button-disabled',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxButton disabled>Disabled</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxButton disabled focusableWhenDisabled>
                Disabled (focusable)
            </button>
        </div>
    `
})
export class RdxButtonDisabledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
