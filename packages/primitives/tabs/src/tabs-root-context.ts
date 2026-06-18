import { Signal } from '@angular/core';
import { createContext, DataOrientation } from '@radix-ng/primitives/core';
import { RdxTabsActivationDirection, RdxTabsValue } from './utils';

export interface RdxTabsRootContext {
    /** Stable id used to derive tab / panel ids. */
    readonly baseId: string;

    /** The value of the currently selected tab. */
    readonly value: Signal<RdxTabsValue | undefined>;

    /** The orientation of the tabs. */
    readonly orientation: Signal<DataOrientation>;

    /** Direction the selection moved relative to the previously active tab. */
    readonly activationDirection: Signal<RdxTabsActivationDirection>;

    /** Whether tabs are activated on focus (set by the list). */
    readonly activateOnFocus: Signal<boolean>;

    /** The `[rdxTabsList]` host element, used to resolve tab order and indicator geometry. */
    readonly tabListElement: Signal<HTMLElement | null>;

    /** Select a tab by value. No-op when the value is unchanged. */
    setValue(value: RdxTabsValue, event?: Event, reason?: string): void;

    /** Mirror the list's `activateOnFocus` input onto the root context. */
    setActivateOnFocus(value: boolean): void;

    /** Register the list host element. */
    setTabListElement(element: HTMLElement | null): void;
}

export const [injectTabsRootContext, provideTabsRootContext] = createContext<RdxTabsRootContext>(
    'RdxTabsRootContext',
    'components/tabs'
);
