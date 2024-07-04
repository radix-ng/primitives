import { Component, Input } from '@angular/core';

import { ShButtonDirective, ShButtonVariant } from '@radix-ng/shadcn/button';

@Component({
    standalone: true,
    imports: [ShButtonDirective],
    templateUrl: './button-example.component.html'
})
export class ButtonExampleComponent {
    // @Input()
    // variant: ShButtonVariant = 'default';
}
