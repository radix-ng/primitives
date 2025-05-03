import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, model, numberAttribute, OnInit, signal } from '@angular/core';
import { clamp, provideToken, snapValueToStep } from '@radix-ng/primitives/core';
import { NUMBER_FIELD_ROOT_CONTEXT, NumberFieldContextToken } from './number-field-context.token';
import { InputMode } from './types';
import { handleDecimalOperation, useNumberFormatter, useNumberParser } from './utils';

@Directive({
    selector: '[rdxNumberFieldRoot]',
    exportAs: 'rdxNumberFieldRoot',
    providers: [provideToken(NUMBER_FIELD_ROOT_CONTEXT, RdxNumberFieldRootDirective)],
    host: {
        role: 'group',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxNumberFieldRootDirective implements OnInit, NumberFieldContextToken {
    readonly value = model<number>();

    readonly min = input<number | undefined, NumberInput>(undefined, { transform: numberAttribute });

    readonly max = input<number | undefined, NumberInput>(undefined, { transform: numberAttribute });

    readonly step = input<number, NumberInput>(1, { transform: numberAttribute });

    readonly stepSnapping = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disableWheelChange = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly locale = input<string>('en');

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly formatOptions = input<Intl.NumberFormatOptions>();

    readonly inputEl = signal<HTMLInputElement | undefined>(undefined);

    readonly isDecreaseDisabled = computed(
        () =>
            this.clampInputValue(this.value()!) === this.min() ||
            (this.min() && !isNaN(this.value()!)
                ? handleDecimalOperation('-', this.value()!, this.step()) < this.min()!
                : false)
    );

    readonly isIncreaseDisabled = computed(
        () =>
            this.clampInputValue(this.value()!) === this.max() ||
            (this.max() && !isNaN(this.value()!)
                ? handleDecimalOperation('+', this.value()!, this.step()) > this.max()!
                : false)
    );

    readonly inputMode = computed<InputMode>(() => {
        // The inputMode attribute influences the software keyboard that is shown on touch devices.
        // Browsers and operating systems are quite inconsistent about what keys are available, however.
        // We choose between numeric and decimal based on whether we allow negative and fractional numbers,
        // and based on testing on various devices to determine what keys are available in each inputMode.
        const hasDecimals = this.numberFormatter().resolvedOptions().maximumFractionDigits! > 0;

        return hasDecimals ? 'decimal' : 'numeric';
    });

    /**
     * Replace negative textValue formatted using currencySign: 'accounting'
     * with a textValue that can be announced using a minus sign.
     */
    readonly textValue = computed(() => (isNaN(this.value()!) ? '' : this.textValueFormatter().format(this.value())));

    readonly onInputElement = (el: HTMLInputElement) => this.inputEl.set(el);

    numberParser: any;
    numberFormatter: any;
    textValueFormatter: any;

    clampInputValue(val: number) {
        // Clamp to min and max, round to the nearest step, and round to the specified number of digits
        let clampedValue: number;
        if (this.step() === undefined || isNaN(this.step()) || !this.stepSnapping()) {
            clampedValue = clamp(val, this.min(), this.max());
        } else {
            clampedValue = snapValueToStep(val, this.min(), this.max(), this.step());
        }

        clampedValue = this.numberParser().parse(this.numberFormatter().format(clampedValue));
        return clampedValue;
    }

    ngOnInit() {
        this.numberParser = useNumberParser(this.locale, this.formatOptions);
        this.numberFormatter = useNumberFormatter(this.locale, this.formatOptions);
        this.textValueFormatter = useNumberFormatter(this.locale, this.formatOptions);
    }

    handleMinMaxValue(type: 'min' | 'max') {
        if (type === 'min' && this.min() !== undefined) {
            this.value.set(this.clampInputValue(this.min()!));
        } else if (type === 'max' && this.max() !== undefined) {
            this.value.set(this.clampInputValue(this.max()!));
        }
    }

    handleDecrease(multiplier = 1) {
        this.handleChangingValue('decrease', multiplier);
    }

    handleIncrease(multiplier = 1) {
        this.handleChangingValue('increase', multiplier);
    }

    applyInputValue(val: string) {
        const parsedValue = this.numberParser().parse(val);

        this.value.set(this.clampInputValue(parsedValue));

        // Set to empty state if input value is empty
        if (!val.length) {
            return this.setInputValue(val);
        }

        // if it failed to parse, then reset input to formatted version of current number
        if (isNaN(parsedValue)) {
            return this.setInputValue(this.textValue());
        }

        return this.setInputValue(this.textValue());
    }

    setInputValue(val: string) {
        if (this.inputEl()) {
            this.inputEl.update((el) => {
                if (el) el.value = val;
                return el;
            });
        }
    }

    validate(val: string) {
        return this.numberParser().isValidPartialNumber(val, this.min(), this.max());
    }

    private handleChangingValue(type: 'increase' | 'decrease', multiplier = 1) {
        this.inputEl()?.focus();
        const currentInputValue = this.numberParser().parse(this.inputEl()?.value ?? '');

        if (this.disabled()) {
            return;
        }

        if (isNaN(currentInputValue)) {
            this.value.set(this.min() ?? 0);
        } else {
            if (type === 'increase') {
                this.value.set(this.clampInputValue(currentInputValue + (this.step() ?? 1) * multiplier));
            } else {
                this.value.set(this.clampInputValue(currentInputValue - (this.step() ?? 1) * multiplier));
            }
        }
    }
}
