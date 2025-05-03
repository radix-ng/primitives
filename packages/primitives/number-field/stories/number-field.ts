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
    styles: `
        :host {
            button,
            input {
                all: unset;
            }
        }

        .NumberFieldWrapper {
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            border: 1px solid;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            height: 2.25rem;
        }

        .NumberFieldWrapper:hover {
            background-color: #fafafa;
        }

        .NumberFieldWrapper:focus-within {
            box-shadow: 0 0 0 2px #1c1917;
        }

        .NumberFieldNumber {
            background-color: transparent;
            width: 5rem;
            font-variant-numeric: tabular-nums;
            text-align: center;
            padding: 0.25rem;
        }

        .NumberFieldNumber:focus {
            outline: none;
        }

        .ButtonField {
            padding: 0.5rem;
            cursor: pointer;
            background-color: transparent;
            background-image: none;
        }
    `
})
export class NumberField {
    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
