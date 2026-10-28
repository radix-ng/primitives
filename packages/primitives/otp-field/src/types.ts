/** The character filter applied before and after a custom value normalizer. */
export type RdxOtpFieldValidationType = 'numeric' | 'alpha' | 'alphanumeric' | 'none';

/** Why the value of an OTP field changed. */
export type RdxOtpFieldChangeReason = 'input-change' | 'input-clear' | 'input-paste' | 'keyboard';

/** Reasons that can complete an OTP value. */
export type RdxOtpFieldCompleteReason = 'input-change' | 'input-paste';

/** Software-keyboard hint passed to each slot and the native form control. */
export type RdxOtpFieldInputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

/** Cancellable value-change event emitted by the root. */
export interface RdxOtpFieldValueChangeEvent {
    value: string;
    eventDetails: import('@radix-ng/primitives/core').RdxCancelableChangeEventDetails<RdxOtpFieldChangeReason>;
}

/** Value-complete event emitted after a user edit has committed. */
export interface RdxOtpFieldValueCompleteEvent {
    value: string;
    reason: RdxOtpFieldCompleteReason;
    event: Event;
}
