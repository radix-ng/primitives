import { InjectionToken, InputSignal, InputSignalWithTransform, ModelSignal, Signal } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';

export type RdxRadioValueChangeReason = 'none';

export interface RadioGroupProps {
    value: ModelSignal<string | null>;
    defaultValue: InputSignal<string | undefined>;
    name: InputSignal<string | undefined>;
    form: InputSignal<string | undefined>;
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    readonly: InputSignalWithTransform<boolean, BooleanInput>;
    required: InputSignalWithTransform<boolean, BooleanInput>;
    disabledState: Signal<boolean>;
}

export interface RadioGroupDirective extends RadioGroupProps {
    select(value: string | null, event?: Event, reason?: RdxRadioValueChangeReason): void;

    onTouched(): void;

    setArrowNavigation(value: boolean): void;

    isArrowNavigation(): boolean;
}

export const RDX_RADIO_GROUP = new InjectionToken<RadioGroupDirective>('RdxRadioGroup');
