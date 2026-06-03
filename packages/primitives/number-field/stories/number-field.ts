import { Component } from '@angular/core';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
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
        LucideDynamicIcon
    ],
    template: `
        <div [value]="10" rdxNumberFieldRoot min="0">
            <label class="text-foreground" for="age">Age</label>
            <div class="NumberFieldWrapper">
                <button class="ButtonField" rdxNumberFieldDecrement>
                    <svg class="flex" [lucideIcon]="Minus" strokeWidth="1" size="16" />
                </button>
                <input class="NumberFieldNumber" id="age" rdxNumberFieldInput />
                <button class="ButtonField" rdxNumberFieldIncrement>
                    <svg class="flex" [lucideIcon]="Plus" strokeWidth="1" size="16" />
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

@Component({
    selector: 'app-number-field-decimal',
    imports: [
        RdxNumberFieldRootDirective,
        RdxNumberFieldInputDirective,
        RdxNumberFieldIncrementDirective,
        RdxNumberFieldDecrementDirective,
        LucideDynamicIcon
    ],
    template: `
        <div [value]="0" [formatOptions]="formatOptions" rdxNumberFieldRoot>
            <label class="text-foreground" for="decimal">Decimal</label>
            <div class="NumberFieldWrapper">
                <button class="ButtonField" rdxNumberFieldDecrement>
                    <svg class="flex" [lucideIcon]="Minus" strokeWidth="1" size="16" />
                </button>
                <input class="NumberFieldNumber" id="decimal" rdxNumberFieldInput />
                <button class="ButtonField" rdxNumberFieldIncrement>
                    <svg class="flex" [lucideIcon]="Plus" strokeWidth="1" size="16" />
                </button>
            </div>
        </div>
    `,
    styleUrl: './number-field.css'
})
export class NumberFieldDecimal {
    readonly formatOptions: Intl.NumberFormatOptions = {
        signDisplay: 'exceptZero',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}

@Component({
    selector: 'app-number-field-percentage',
    imports: [
        RdxNumberFieldRootDirective,
        RdxNumberFieldInputDirective,
        RdxNumberFieldIncrementDirective,
        RdxNumberFieldDecrementDirective,
        LucideDynamicIcon
    ],
    template: `
        <div [value]="0.05" [formatOptions]="formatOptions" step="0.01" rdxNumberFieldRoot>
            <label class="text-foreground" for="percentage">Percentage</label>
            <div class="NumberFieldWrapper">
                <button class="ButtonField" rdxNumberFieldDecrement>
                    <svg class="flex" [lucideIcon]="Minus" strokeWidth="1" size="16" />
                </button>
                <input class="NumberFieldNumber" id="percentage" rdxNumberFieldInput />
                <button class="ButtonField" rdxNumberFieldIncrement>
                    <svg class="flex" [lucideIcon]="Plus" strokeWidth="1" size="16" />
                </button>
            </div>
        </div>
    `,
    styleUrl: './number-field.css'
})
export class NumberFieldPercentage {
    readonly formatOptions: Intl.NumberFormatOptions = {
        style: 'percent'
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}

@Component({
    selector: 'app-number-field-currency',
    imports: [
        RdxNumberFieldRootDirective,
        RdxNumberFieldInputDirective,
        RdxNumberFieldIncrementDirective,
        RdxNumberFieldDecrementDirective,
        LucideDynamicIcon
    ],
    template: `
        <div [value]="5" [formatOptions]="formatOptions" rdxNumberFieldRoot>
            <label class="text-foreground" for="currency">Currency</label>
            <div class="NumberFieldWrapper">
                <button class="ButtonField" rdxNumberFieldDecrement>
                    <svg class="flex" [lucideIcon]="Minus" strokeWidth="1" size="16" />
                </button>
                <input class="NumberFieldNumber" id="currency" rdxNumberFieldInput />
                <button class="ButtonField" rdxNumberFieldIncrement>
                    <svg class="flex" [lucideIcon]="Plus" strokeWidth="1" size="16" />
                </button>
            </div>
        </div>
    `,
    styleUrl: './number-field.css'
})
export class NumberFieldCurrency {
    readonly formatOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'EUR',
        currencyDisplay: 'code',
        currencySign: 'accounting'
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}

@Component({
    selector: 'app-number-field-units',
    imports: [
        RdxNumberFieldRootDirective,
        RdxNumberFieldInputDirective,
        RdxNumberFieldIncrementDirective,
        RdxNumberFieldDecrementDirective,
        LucideDynamicIcon
    ],
    template: `
        <div [value]="5" [formatOptions]="formatOptions" rdxNumberFieldRoot>
            <label class="text-foreground" for="units">Units</label>
            <div class="NumberFieldWrapper">
                <button class="ButtonField" rdxNumberFieldDecrement>
                    <svg class="flex" [lucideIcon]="Minus" strokeWidth="1" size="16" />
                </button>
                <input class="NumberFieldNumber" id="units" rdxNumberFieldInput />
                <button class="ButtonField" rdxNumberFieldIncrement>
                    <svg class="flex" [lucideIcon]="Plus" strokeWidth="1" size="16" />
                </button>
            </div>
        </div>
    `,
    styleUrl: './number-field.css'
})
export class NumberFieldUnits {
    readonly formatOptions: Intl.NumberFormatOptions = {
        style: 'unit',
        unit: 'meter',
        unitDisplay: 'long'
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
