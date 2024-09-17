import { InjectionToken } from '@angular/core';

export interface RadioGroupProps {
    name?: string;
    disabled?: boolean;
    defaultValue?: string;
    value?: string;
}

export interface RadioGroupDirective extends RadioGroupProps {
    select(value: string): void;

    onTouched(): void;
}

export const RDX_RADIO_GROUP = new InjectionToken<RadioGroupDirective>('RdxRadioGroup');
