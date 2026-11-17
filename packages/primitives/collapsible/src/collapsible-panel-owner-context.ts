import { Signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import type { CollapsibleRootContext } from './collapsible-root.directive';

/** @internal A structural composition owns the complete Panel view and its mounting policy. */
export interface RdxCollapsiblePanelOwnerContext {
    readonly root: CollapsibleRootContext;
    readonly keepMounted: Signal<boolean>;
    readonly hiddenUntilFound: Signal<boolean>;
    readonly preventInitialOpenAnimation: Signal<boolean>;
}

export const [injectCollapsiblePanelOwnerContext, provideCollapsiblePanelOwnerContext] =
    createContext<RdxCollapsiblePanelOwnerContext>('CollapsiblePanelOwnerContext', 'components/collapsible');
