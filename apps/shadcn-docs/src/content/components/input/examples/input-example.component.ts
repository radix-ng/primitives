import { Component } from '@angular/core';
import { ShInputDirective } from '@radix-ng/shadcn/input';

@Component({
    standalone: true,
    imports: [ShInputDirective],
    template: `
        <input
            shInput
            type="email"
            placeholder="Email"
        />
    `
})
export class InputExampleComponent {}
