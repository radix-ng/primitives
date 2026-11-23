import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-button-default-example',
    imports: [RdxButtonDirective],
    template: `
        <button class="demo-button demo-button-outline h-8 px-3 leading-none" rdxButton>Button</button>
    `
})
export class ButtonDefaultStory {}
