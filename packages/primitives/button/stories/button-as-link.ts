import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The directive works on any host. Here it renders an `<a>` as a button while
 * keeping native link behavior.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-as-link',
    imports: [RdxButtonDirective],
    template: `
        <a rdxButton href="https://base-ui.com" target="_blank" [class]="cn(b.base, b.secondary, b.size.md)">
            Open Base UI
        </a>
    `
})
export class RdxButtonAsLinkComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
