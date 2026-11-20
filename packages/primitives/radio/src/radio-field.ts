import type { Signal } from '@angular/core';

/** @internal The native input is optional and belongs to the lifetime of its authored item. */
export interface RadioNativeInput {
    readonly element: HTMLInputElement;
    readonly id: Signal<string>;
}

/** @internal Radio metadata kept on the existing Composite item registration. */
export interface RadioItemRegistration {
    readonly value: Signal<unknown>;
    readonly disabled: Signal<boolean>;
    readonly nativeInput: Signal<RadioNativeInput | null>;
}
