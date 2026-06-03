import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Visual variants — the recommended `demoButton` styling from the centralized
 * style layer applied on top of the headless `rdxButton` directive.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-variants',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button rdxButton [class]="cn(b.base, b.primary, b.size.md)">Primary</button>
            <button rdxButton [class]="cn(b.base, b.secondary, b.size.md)">Secondary</button>
            <button rdxButton [class]="cn(b.base, b.outline, b.size.md)">Outline</button>
            <button rdxButton [class]="cn(b.base, b.ghost, b.size.md)">Ghost</button>
            <button rdxButton [class]="cn(b.base, b.destructive, b.size.md)">Destructive</button>
        </div>
    `
})
export class RdxButtonVariantsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
