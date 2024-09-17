import { Component } from '@angular/core';
import { ShCheckboxComponent } from '@radix-ng/shadcn/checkbox';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

@Component({
    standalone: true,
    imports: [ShCheckboxComponent, ShLabelDirective],
    template: `
        <div class="flex items-center space-x-2">
            <sh-checkbox id="terms" />
            <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                shLabel
                htmlFor="terms"
            >
                Accept terms and conditions
            </label>
        </div>
    `
})
export class CheckboxExampleComponent {}
