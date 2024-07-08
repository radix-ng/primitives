import { Component } from '@angular/core';

import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

@Component({
    standalone: true,
    imports: [ShInputDirective, ShLabelDirective],
    templateUrl: './input-file-example.component.html'
})
export class InputFileExampleComponent {}
