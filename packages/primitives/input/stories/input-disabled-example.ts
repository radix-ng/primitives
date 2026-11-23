import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-input-disabled-example',
    imports: [FormsModule, ReactiveFormsModule, RdxInputDirective],
    template: `
        <input class="demo-input h-8 w-full px-2" rdxInput disabled defaultValue="name@example.com" />
    `
})
export class InputDisabledStory {}
