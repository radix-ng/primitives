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

    /** Toggle the pressed state of `value` within the group. */
    toggle(
        value: string,
        event?: Event,
        eventDetails?: RdxCancelableChangeEventDetails<RdxToggleGroupContextChangeReason>
    ): void;
}

export const [injectToggleGroupContext, provideToggleGroupContext] = createContext<RdxToggleGroupContext>(
    'RdxToggleGroupContext',
    'components/toggle-group'
);
