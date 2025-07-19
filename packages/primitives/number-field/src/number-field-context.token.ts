import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { inject, InjectionToken, InputSignal, InputSignalWithTransform, ModelSignal, Signal } from '@angular/core';
import { InputMode } from './types';

export interface NumberFieldContextToken {
    value: ModelSignal<number | undefined>;
    locale: InputSignal<string>;
    inputMode: Signal<InputMode>;
    textValue: Signal<any>;
    readonly: InputSignalWithTransform<boolean, BooleanInput>;
    max: InputSignalWithTransform<number | undefined, NumberInput>;
    min: InputSignalWithTransform<number | undefined, NumberInput>;
    onInputElement: (el: HTMLInputElement) => void;
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    disableWheelChange: InputSignalWithTransform<boolean, BooleanInput>;
    handleIncrease: (multiplier?: number) => void;
    handleDecrease: (multiplier?: number) => void;
    applyInputValue: (val: string) => void;
    validate: (val: string) => boolean;
    setInputValue: (val: string) => void;
    isIncreaseDisabled: Signal<boolean>;
    isDecreaseDisabled: Signal<boolean>;
    handleMinMaxValue: (type: 'min' | 'max') => void;
}

export const NUMBER_FIELD_ROOT_CONTEXT = new InjectionToken<NumberFieldContextToken>('NUMBER_FIELD_ROOT_CONTEXT');

export function injectNumberFieldRootContext(): NumberFieldContextToken {
    return inject(NUMBER_FIELD_ROOT_CONTEXT);
}
