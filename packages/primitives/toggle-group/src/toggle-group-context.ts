import { Signal } from '@angular/core';
import { createContext, DataOrientation } from '@radix-ng/primitives/core';

/**
 * Shared state a {@link RdxToggle} reads when it participates in a toggle group.
 */
export interface RdxToggleGroupContext {
    /** The currently pressed values. */
    readonly value: Signal<string[]>;

    /** Whether the whole group is disabled. */
    readonly disabled: Signal<boolean>;

    /** Whether more than one item can be pressed at a time. */
    readonly multiple: Signal<boolean>;

    /** The orientation of the group. */
    readonly orientation: Signal<DataOrientation>;

    /** Toggle the pressed state of `value` within the group. */
    toggle(value: string): void;
}

export const [injectToggleGroupContext, provideToggleGroupContext] = createContext<RdxToggleGroupContext>(
    'RdxToggleGroupContext',
    'components/toggle-group'
);
