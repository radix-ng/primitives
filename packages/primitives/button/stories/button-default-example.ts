import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-button-default-example',
    imports: [RdxButtonDirective],
    template: `
        <button class="demo-button demo-button-primary h-9 px-4" rdxButton>Button</button>
    `
})
export class ButtonDefaultStory {}
