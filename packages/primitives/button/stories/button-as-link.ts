import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

/**
 * The directive works on any host. Here it renders an `<a>` as a button while
 * keeping native link behavior.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-as-link',
    imports: [RdxButtonDirective],
    template: `
        <a class="demo-button demo-button-secondary h-9 px-4" rdxButton href="https://base-ui.com" target="_blank">
            Open Base UI
        </a>
    `
})
export class RdxButtonAsLinkComponent {}
