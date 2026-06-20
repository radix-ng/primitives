import { Signal } from '@angular/core';
import { createContext, DataOrientation, RdxCancelableChangeEventDetails } from '@radix-ng/primitives/core';

type RdxToggleGroupContextChangeReason = 'none';

/**
 * Shared state a {@link RdxToggle} reads when it participates in a toggle group.
 */
export interface RdxToggleGroupContext {
    /** The currently pressed values. */
    readonly value: Signal<string[]>;

    /** Whether the whole group is disabled. */
    readonly disabled: Signal<boolean>;

    /** The orientation of the group. */
    readonly orientation: Signal<DataOrientation>;

    /** Whether the group value was initialized by `value` or `defaultValue`. */
    readonly isValueInitialized: Signal<boolean>;

    /**
     * Set the pressed state of `value` within the group. The item computes the next pressed boolean
     * (Base UI parity — the item is the source of truth), so the group applies it rather than
     * re-deriving the toggle from its current value set.
     */
    toggle(
        value: string,
        nextPressed: boolean,
        event?: Event,
        eventDetails?: RdxCancelableChangeEventDetails<RdxToggleGroupContextChangeReason>
    ): void;
}

export const [injectToggleGroupContext, provideToggleGroupContext] = createContext<RdxToggleGroupContext>(
    'RdxToggleGroupContext',
    'components/toggle-group'
);
