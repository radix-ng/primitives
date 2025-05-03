import { Component } from '@angular/core';
import { LucideAngularModule, Minus, Plus } from 'lucide-angular';
import { RdxNumberFieldDecrementDirective } from '../src/number-field-decrement.directive';
import { RdxNumberFieldIncrementDirective } from '../src/number-field-increment.directive';
import { RdxNumberFieldInputDirective } from '../src/number-field-input.directive';
import { RdxNumberFieldRootDirective } from '../src/number-field-root.directive';

@Component({
    selector: 'app-number-field',
    imports: [
        RdxNumberFieldRootDirective,
        RdxNumberFieldInputDirective,
        RdxNumberFieldIncrementDirective,
        RdxNumberFieldDecrementDirective,
        LucideAngularModule
    ],
    template: `
        <div [value]="10" rdxNumberFieldRoot min="0">
            <label for="age" style="color: white;">Age</label>
            <div class="NumberFieldWrapper">
                <button class="ButtonField" rdxNumberFieldDecrement>
                    <lucide-angular [img]="Minus" style="display: flex;" strokeWidth="1" size="16" />
                </button>
                <input class="NumberFieldNumber" id="age" rdxNumberFieldInput />
                <button class="ButtonField" rdxNumberFieldIncrement>
                    <lucide-angular [img]="Plus" style="display: flex;" strokeWidth="1" size="16" />
                </button>
            </div>
        </div>
    `,
    styleUrl: './number-field.css'
})
export class NumberField {
    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
