import { InjectionToken, Signal, WritableSignal } from '@angular/core';

export interface CollectionItemRecord {
    ref: HTMLElement;
    value?: any;
}

export interface CollectionContext {
    collectionElementRef: Signal<HTMLElement | null>;
    itemMap: WritableSignal<Map<HTMLElement, CollectionItemRecord>>;
}

export const COLLECTION_CONTEXT_TOKEN = new InjectionToken<CollectionContext>('RDX_COLLECTION_CONTEXT');
