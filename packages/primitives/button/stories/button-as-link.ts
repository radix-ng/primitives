import { Component } from '@angular/core';
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';

/**
 * The directive works on any host. Here it renders an `<a>` as a button while
 * keeping native link behavior.
 */
@Component({
    selector: 'rdx-button-as-link',
    imports: [RdxButtonDirective],
    template: `
        <a [class]="cn(b.base, b.secondary, b.size.md)" rdxButton href="https://base-ui.com" target="_blank">
            Open Base UI
        </a>
    `
})
export class RdxButtonAsLinkComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
