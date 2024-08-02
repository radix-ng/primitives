import { Component } from '@angular/core';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import { ShInputDirective } from '@radix-ng/shadcn/input';

@Component({
    standalone: true,
    imports: [ShInputDirective, ShButtonDirective],
    template: `
        <div class="flex w-full max-w-sm items-center space-x-2">
            <input shInput type="email" placeholder="Email" />
            <button shButton type="submit">Subscribe</button>
        </div>
    `
})
export class InputWithButtonExampleComponent {}
