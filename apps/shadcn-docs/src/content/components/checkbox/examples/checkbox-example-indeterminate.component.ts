import { Component } from '@angular/core';

import { ShCheckboxComponent } from '@radix-ng/shadcn/checkbox';
import { ShLabelDirective } from '@radix-ng/shadcn/label';

@Component({
    standalone: true,
    imports: [ShCheckboxComponent, ShLabelDirective],
    template: `
        <div class="items-top flex space-x-2">
            <sh-checkbox id="terms2" [indeterminate]="indeterminate"></sh-checkbox>
            <div class="grid gap-1.5 leading-none">
                <label
                    shLabel
                    htmlFor="terms2"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Accept terms and conditions
                </label>
                <p class="text-muted-foreground mt-0 text-sm">
                    You agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    `
})
export class CheckboxExampleIndeterminateComponent {
    indeterminate = true;
}
