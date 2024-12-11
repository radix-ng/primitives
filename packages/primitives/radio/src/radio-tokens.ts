import { BooleanInput } from '@angular/cdk/coercion';
import { InjectionToken, InputSignalWithTransform, ModelSignal, Signal } from '@angular/core';

export interface RadioGroupProps {
    name?: string;
    disabled?: InputSignalWithTransform<boolean, BooleanInput>;
    defaultValue?: string;
    value: ModelSignal<string | null>;
    disableState: Signal<boolean>;
}

export interface RadioGroupDirective extends RadioGroupProps {
    select(value: string | null): void;

    onTouched(): void;
}

export const RDX_RADIO_GROUP = new InjectionToken<RadioGroupDirective>('RdxRadioGroup');
