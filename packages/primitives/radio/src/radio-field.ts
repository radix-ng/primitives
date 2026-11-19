import type { Signal } from '@angular/core';
import type { RdxFieldRootContext } from '@radix-ng/primitives/field';

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

/** Merge explicit, group and item descriptions without duplicating shared Field error IDs. */
export function radioDescribedBy(explicit: string | undefined, ...fields: (RdxFieldRootContext | null)[]) {
    const ids = new Set(explicit?.split(/\s+/).filter(Boolean));
    for (const field of fields) {
        field?.descriptionIds().forEach((id) => ids.add(id));
        field?.errorIds().forEach((id) => ids.add(id));
    }
    return ids.size ? [...ids].join(' ') : undefined;
}
