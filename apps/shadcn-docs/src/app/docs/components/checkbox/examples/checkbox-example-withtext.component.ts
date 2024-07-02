import { Component } from '@angular/core';

import { ShCheckboxComponent } from '@radix-ng/shadcn/checkbox';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

@Component({
    standalone: true,
    imports: [ShCheckboxComponent, ShLabelDirective],
    templateUrl: './checkbox-example-withtext.component.html',
    styles: `
        :host {
            @apply flex min-h-[350px] w-full items-center justify-center p-10;
        }
    `
})
export class CheckboxExampleWithTextComponent {}
