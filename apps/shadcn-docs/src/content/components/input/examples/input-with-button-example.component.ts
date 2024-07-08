import { Component } from '@angular/core';

import { ShButtonDirective } from '@radix-ng/shadcn/button';
import { ShInputDirective } from '@radix-ng/shadcn/input';

@Component({
    standalone: true,
    imports: [ShInputDirective, ShButtonDirective],
    templateUrl: './input-with-button-example.component.html'
})
export class InputWithButtonExampleComponent {}
