import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';

/**
 * Sizes, including a square icon button.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-sizes',
    imports: [RdxButtonDirective, LucideDynamicIcon, LucidePlus],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button rdxButton [class]="cn(b.base, b.primary, b.size.sm)">Small</button>
            <button rdxButton [class]="cn(b.base, b.primary, b.size.md)">Medium</button>
            <button rdxButton [class]="cn(b.base, b.primary, b.size.lg)">Large</button>
            <button rdxButton aria-label="Add" [class]="cn(b.base, b.primary, b.size.icon)">
                <svg class="flex" lucidePlus size="16" />
            </button>
        </div>
    `
})
export class RdxButtonSizesComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
