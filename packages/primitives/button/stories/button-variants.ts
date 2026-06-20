import { ChangeDetectionStrategy, Component } from '@angular/core';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

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
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxButton>Primary</button>
            <button [class]="cn(b.base, b.secondary, b.size.md)" rdxButton>Secondary</button>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxButton>Outline</button>
            <button [class]="cn(b.base, b.ghost, b.size.md)" rdxButton>Ghost</button>
            <button [class]="cn(b.base, b.destructive, b.size.md)" rdxButton>Destructive</button>
        </div>
    `
})
export class RdxButtonVariantsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
