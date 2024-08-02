import { Component } from '@angular/core';
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

@Component({
    standalone: true,
    imports: [ShInputDirective, ShLabelDirective],
    template: `
        <div class="grid w-full max-w-sm items-center gap-1.5">
            <label shLabel htmlFor="picture">Picture</label>
            <input id="picture" shInput type="file" />
        </div>
    `
})
export class InputFileExampleComponent {}
