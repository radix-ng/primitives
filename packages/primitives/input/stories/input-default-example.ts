import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-input-default-example',
    imports: [FormsModule, ReactiveFormsModule, RdxInputDirective],
    template: `
        <input class="demo-input h-9 w-full px-3" rdxInput placeholder="name@example.com" />
    `
})
export class InputDefaultStory {}
