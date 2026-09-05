import { inject, InjectionToken, Provider, Signal } from '@angular/core';
import { RdxCompositeListContext, RdxCompositeRootContext } from './types';

/**
 * Explicitly assigns a composite item to contexts that are not visible through its declaring
 * injector tree, such as a list inside a component that receives the item through content
 * projection. An owner is authoritative even while either context is `null`.
 *
 * @internal Exported only for coordination between Radix NG secondary entry points. This API has no
 * semver stability guarantee.
 */
export interface RdxCompositeItemOwner {
    readonly rootContext: Signal<RdxCompositeRootContext | null>;
    readonly listContext: Signal<RdxCompositeListContext | null>;
}

const RDX_COMPOSITE_ITEM_OWNER = new InjectionToken<RdxCompositeItemOwner>('RdxCompositeItemOwner');

/**
 * @internal Exported only for coordination between Radix NG secondary entry points. This API has no
 * semver stability guarantee.
 */
export function injectRdxCompositeItemOwner(): RdxCompositeItemOwner | null {
    return inject(RDX_COMPOSITE_ITEM_OWNER, { optional: true, self: true });
}

/**
 * @internal Exported only for coordination between Radix NG secondary entry points. This API has no
 * semver stability guarantee.
 */
export function provideRdxCompositeItemOwner(useFactory: () => RdxCompositeItemOwner): Provider {
    return { provide: RDX_COMPOSITE_ITEM_OWNER, useFactory };
}
