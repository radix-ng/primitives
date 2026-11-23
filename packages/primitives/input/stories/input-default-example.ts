import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-input-default-example',
    imports: [FormsModule, ReactiveFormsModule, RdxInputDirective],
    template: `
        <label class="text-foreground flex flex-col items-start gap-1 text-sm font-bold">
            Email
            <input class="demo-input h-8 w-40 px-2 font-normal" rdxInput type="email" placeholder="name@example.com" />
        </label>
    `
})
export class InputDefaultStory {}
