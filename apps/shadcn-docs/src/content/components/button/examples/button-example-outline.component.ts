import { Component } from '@angular/core';
import { ShButtonDirective } from '@radix-ng/shadcn/button';

@Component({
    standalone: true,
    imports: [ShButtonDirective],
    template: `
        <button shButton variant="outline">Outline</button>
    `
})
export class ButtonExampleOutlineComponent {}
