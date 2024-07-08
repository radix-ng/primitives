import { Component } from '@angular/core';

import { ShInputDirective } from '@radix-ng/shadcn/input';

@Component({
    standalone: true,
    imports: [ShInputDirective],
    templateUrl: './input-example.component.html'
})
export class InputExampleComponent {}
