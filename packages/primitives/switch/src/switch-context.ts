import { Signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface RdxSwitchContext {
    /** Whether the switch is on. */
    readonly checked: Signal<boolean>;

    /** Whether the switch is disabled. */
    readonly disabled: Signal<boolean>;

    /** Whether the switch is read-only (focusable, but cannot be toggled). */
    readonly readonly: Signal<boolean>;

    /** Whether the switch must be on to submit the owning form. */
    readonly required: Signal<boolean>;

    /** Name of the hidden form input. */
    readonly name: Signal<string | undefined>;

    /** Value submitted with the form when the switch is on. */
    readonly value: Signal<string>;

    readonly ariaLabel: Signal<string | undefined>;
    readonly ariaLabelledBy: Signal<string | undefined>;

    markAsTouched(): void;
}

export const [injectSwitchContext, provideSwitchContext] = createContext<RdxSwitchContext>('RdxSwitchContext');
