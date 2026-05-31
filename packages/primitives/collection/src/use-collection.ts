import { inject } from '@angular/core';
import { RdxCollectionProvider } from './collection-provider';

/**
 * Convenience accessor for the nearest {@link RdxCollectionProvider}. Equivalent to
 * `inject(RdxCollectionProvider)`; returns the provider with its reactive `items`/`enabledItems`.
 */
export function useCollection(): RdxCollectionProvider {
    return inject(RdxCollectionProvider);
}
