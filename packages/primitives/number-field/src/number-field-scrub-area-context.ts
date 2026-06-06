import { Signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface RdxNumberFieldScrubAreaContext {
    /** Whether a scrub gesture is currently in progress. */
    readonly isScrubbing: Signal<boolean>;
    /** Whether the active scrub was started with touch input. */
    readonly isTouchInput: Signal<boolean>;
    /** Whether the browser denied the Pointer Lock request. */
    readonly isPointerLockDenied: Signal<boolean>;
    /** Registers (or clears) the virtual cursor element so the scrub area can move it. */
    registerCursor(element: HTMLElement | null): void;
}

/**
 * Context shared from the scrub area to its virtual cursor child.
 *
 * @see https://base-ui.com/react/components/number-field
 */
export const [injectNumberFieldScrubAreaContext, provideNumberFieldScrubAreaContext] =
    createContext<RdxNumberFieldScrubAreaContext>('RdxNumberFieldScrubAreaContext');
