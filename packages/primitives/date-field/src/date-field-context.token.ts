import { inject, InjectionToken, InputSignal, ModelSignal, Signal, WritableSignal } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { Formatter, HourCycle, SegmentValueObj } from '@radix-ng/primitives/core';

export interface DateFieldContextToken {
    locale: InputSignal<string>;
    value: ModelSignal<DateValue | undefined>;
    disabled: InputSignal<boolean>;
    readonly: InputSignal<boolean>;
    isInvalid: Signal<boolean>;
    placeholder: ModelSignal<DateValue>;
    hourCycle: InputSignal<HourCycle>;
    formatter: Formatter;
    segmentValues: WritableSignal<SegmentValueObj>;
    focusNext: () => void;
    setFocusedElement: (el: HTMLElement) => void;
}

export const DATE_FIELDS_ROOT_CONTEXT = new InjectionToken<DateFieldContextToken>('DATE_FIELDS_ROOT_CONTEXT');

export function injectDateFieldsRootContext(): DateFieldContextToken {
    return inject(DATE_FIELDS_ROOT_CONTEXT);
}
