import { Component, Input } from '@angular/core';

import { ShButtonDirective, ShButtonVariant } from '@radix-ng/shadcn/button';

@Component({
    standalone: true,
    imports: [ShButtonDirective],
    templateUrl: './button-example.component.html',
    styles: `
        :host {
            @apply flex min-h-[350px] w-full items-center justify-center p-10;
        }
    `
})
export class ButtonExampleComponent {
    // @Input()
    // variant: ShButtonVariant = 'default';
}
