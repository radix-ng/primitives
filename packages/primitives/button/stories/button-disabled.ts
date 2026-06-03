import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

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
            <button rdxButton disabled [class]="cn(b.base, b.primary, b.size.md)">Disabled</button>
            <button rdxButton disabled focusableWhenDisabled [class]="cn(b.base, b.outline, b.size.md)">
                Disabled (focusable)
            </button>
        </div>
    `
})
export class RdxButtonDisabledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
