import { inject, InjectionToken, InputSignal, ModelSignal, Signal, WritableSignal } from '@angular/core';
import { DateStep, Formatter, HourCycle, SegmentValueObj, TimeValue } from '@radix-ng/primitives/core';

export interface TimeFieldContextToken {
    locale: InputSignal<string>;
    value: ModelSignal<TimeValue | null>;
    /** The controlled placeholder; may be `undefined`. Use `convertedPlaceholder` for segment math. */
    placeholder: Signal<TimeValue | undefined>;
    isInvalid: Signal<boolean>;
    /** Effective invalid: the built-in range check OR the form-driven invalid state. */
    invalidState: Signal<boolean>;
    /** Tri-state displayed validity (`true`/`false`/`null`): the field's gated state inside a Field, else own. */
    displayValid: Signal<boolean | null>;
    // Read-only views: consumers only read these. Typed as `Signal<…>` supertypes so the concrete
    // signal kind (transformed input, model, computed) is an implementation detail and mocks stay simple.
    disabled: Signal<boolean>;
    readonly: Signal<boolean>;
    formatter: Signal<Formatter>;
    hourCycle: Signal<HourCycle | undefined>;
    segmentValues: WritableSignal<SegmentValueObj>;
    focusNext: () => void;
    setFocusedElement: (el: HTMLElement) => void;
    convertedModelValue: WritableSignal<TimeValue | null>;
    convertedPlaceholder: WritableSignal<TimeValue>;
    step$: Signal<DateStep>;
}

export const TIME_FIELDS_ROOT_CONTEXT = new InjectionToken<TimeFieldContextToken>('TIME_FIELDS_ROOT_CONTEXT');

export function injectTimeFieldsRootContext(): TimeFieldContextToken {
    return inject(TIME_FIELDS_ROOT_CONTEXT);
}
