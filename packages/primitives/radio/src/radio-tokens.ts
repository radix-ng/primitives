import { InjectionToken, ModelSignal } from '@angular/core';

export interface RadioGroupProps {
    name?: string;
    disabled?: boolean;
    defaultValue?: string;
    value?: ModelSignal<string | undefined>;
}

export interface RadioGroupDirective extends RadioGroupProps {
    select(value: string | undefined): void;

    onTouched(): void;
}

export const RDX_RADIO_GROUP = new InjectionToken<RadioGroupDirective>('RdxRadioGroup');
