import { Component } from '@angular/core';

import { ShCheckboxComponent } from '@radix-ng/shadcn/checkbox';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

@Component({
    standalone: true,
    imports: [ShCheckboxComponent, ShLabelDirective],
    templateUrl: './checkbox-example-withtext.component.html'
})
export class CheckboxExampleWithTextComponent {}
