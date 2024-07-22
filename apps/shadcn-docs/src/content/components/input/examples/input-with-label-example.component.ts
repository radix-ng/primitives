import { Component } from '@angular/core';

import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

@Component({
    standalone: true,
    imports: [ShInputDirective, ShLabelDirective],
    template: `
        <div class="grid w-full max-w-sm items-center gap-1.5">
            <label shLabel htmlFor="email">Email</label>
            <input shInput type="email" id="email" />
        </div>
    `
})
export class InputWithLabelExampleComponent {}
