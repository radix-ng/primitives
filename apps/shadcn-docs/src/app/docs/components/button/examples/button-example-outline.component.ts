import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';

@Component({
    standalone: true,
    imports: [ShButtonDirective],
    templateUrl: './button-example-outline.component.html',
    styles: `
        :host {
            @apply flex min-h-[350px] w-full items-center justify-center p-10;
        }
    `
})
export class ButtonExampleOutlineComponent {}
