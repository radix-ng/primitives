import { inject, InjectionToken, InputSignal, ModelSignal, Signal, WritableSignal } from '@angular/core';
import { DateStep, Formatter, HourCycle, SegmentValueObj, TimeValue } from '@radix-ng/primitives/core';

export interface TimeFieldContextToken {
    locale: InputSignal<string>;
    value: ModelSignal<TimeValue | undefined>;
    placeholder: ModelSignal<TimeValue>;
    isInvalid: Signal<boolean>;
    disabled: InputSignal<boolean>;
    readonly: InputSignal<boolean>;
    formatter: Formatter;
    hourCycle: InputSignal<HourCycle>;
    segmentValues: WritableSignal<SegmentValueObj>;
    focusNext: () => void;
    setFocusedElement: (el: HTMLElement) => void;
    convertedModelValue: WritableSignal<TimeValue | undefined>;
    convertedPlaceholder: WritableSignal<TimeValue>;
    step$: Signal<DateStep>;
}

export const TIME_FIELDS_ROOT_CONTEXT = new InjectionToken<TimeFieldContextToken>('TIME_FIELDS_ROOT_CONTEXT');

export function injectTimeFieldsRootContext(): TimeFieldContextToken {
    return inject(TIME_FIELDS_ROOT_CONTEXT);
}
