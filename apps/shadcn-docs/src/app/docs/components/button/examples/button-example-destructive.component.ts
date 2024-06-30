import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';

@Component({
    standalone: true,
    imports: [ShButtonDirective],
    templateUrl: './button-example-destructive.component.html'
})
export class ButtonExampleDestructiveComponent {}
