import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';

@Component({
    standalone: true,
    imports: [ShButtonDirective],
    templateUrl: './button-example-link.component.html'
})
export class ButtonExampleLinkComponent {}
