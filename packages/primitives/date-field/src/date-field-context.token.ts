import { inject, InjectionToken, InputSignal, ModelSignal, Signal, WritableSignal } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { DateStep, Formatter, HourCycle, SegmentValueObj } from '@radix-ng/primitives/core';

export interface DateFieldContextToken {
    locale: InputSignal<string>;
    value: ModelSignal<DateValue | null>;
    // Read-only views: consumers only read these. Typed as `Signal<…>` supertypes so the concrete
    // signal kind (transformed input, model, computed) is an implementation detail and mocks stay simple.
    disabled: Signal<boolean>;
    readonly: Signal<boolean>;
    isInvalid: Signal<boolean>;
    /** Effective invalid: the built-in range/availability check OR the form-driven invalid state. */
    invalidState: Signal<boolean>;
    /** Tri-state displayed validity (`true`/`false`/`null`): the field's gated state inside a Field, else own. */
    displayValid: Signal<boolean | null>;
    /** The controlled placeholder; may be `undefined`. Use `effectivePlaceholder` for segment math. */
    placeholder: Signal<DateValue | undefined>;
    /** Always-defined placeholder (falls back to the default date) for segment attributes/key handlers. */
    effectivePlaceholder: Signal<DateValue>;
    hourCycle: Signal<HourCycle | undefined>;
    step$: Signal<DateStep>;
    formatter: Signal<Formatter>;
    segmentValues: WritableSignal<SegmentValueObj>;
    focusNext: () => void;
    setFocusedElement: (el: HTMLElement) => void;
}

export const DATE_FIELDS_ROOT_CONTEXT = new InjectionToken<DateFieldContextToken>('DATE_FIELDS_ROOT_CONTEXT');

export function injectDateFieldsRootContext(): DateFieldContextToken {
    return inject(DATE_FIELDS_ROOT_CONTEXT);
}
