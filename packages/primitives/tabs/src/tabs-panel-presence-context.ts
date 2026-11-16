import { Signal } from '@angular/core';
import { createContext, RdxTransitionStatusRef } from '@radix-ng/primitives/core';
import { RdxTabsRootContext } from './tabs-root-context';
import { RdxTabsValue } from './utils';

/** The structural owner outlives its native Panel and owns its stable identity. */
export interface RdxTabsPanelPresenceContext {
    readonly root: RdxTabsRootContext;
    readonly value: Signal<RdxTabsValue>;
    readonly keepMounted: Signal<boolean>;
    readonly exiting: Signal<boolean>;
    readonly transition: RdxTransitionStatusRef;
    readonly id: string;
}

export const [injectTabsPanelPresenceContext, provideTabsPanelPresenceContext] =
    createContext<RdxTabsPanelPresenceContext>('RdxTabsPanelPresenceContext', 'components/tabs');
