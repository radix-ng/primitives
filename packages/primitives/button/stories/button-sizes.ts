import { Component } from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

/**
 * Sizes, including a square icon button.
 */
@Component({
    selector: 'rdx-button-sizes',
    imports: [RdxButtonDirective, LucideDynamicIcon, LucidePlus],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxButton>Small</button>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxButton>Medium</button>
            <button [class]="cn(b.base, b.primary, b.size.lg)" rdxButton>Large</button>
            <button [class]="cn(b.base, b.primary, b.size.icon)" rdxButton aria-label="Add">
                <svg class="flex" lucidePlus size="16" />
            </button>
        </div>
    `
})
export class RdxButtonSizesComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
