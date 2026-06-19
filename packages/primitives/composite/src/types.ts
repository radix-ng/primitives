import { Signal } from '@angular/core';
import { Direction } from '@radix-ng/primitives/core';

export type RdxCompositeOrientation = 'horizontal' | 'vertical' | 'both';
export type RdxCompositeModifierKey = 'Shift' | 'Control' | 'Alt' | 'Meta';

export type RdxCompositeItemMetadata = Record<string, unknown>;

export interface RdxCompositeItemRegistration<Metadata extends RdxCompositeItemMetadata = RdxCompositeItemMetadata> {
    element: HTMLElement;
    metadata: Signal<Metadata | null | undefined>;
}

export type RdxCompositeMetadata<Metadata extends RdxCompositeItemMetadata = RdxCompositeItemMetadata> = {
    index: number;
} & Metadata;

export interface RdxCompositeListContext {
    listElement: HTMLElement;
    items: Signal<RdxCompositeItemRegistration[]>;
    itemMap: Signal<Map<HTMLElement, RdxCompositeMetadata>>;
    registerItem: <Metadata extends RdxCompositeItemMetadata>(
        item: RdxCompositeItemRegistration<Metadata>
    ) => () => void;
    indexOf: (element: HTMLElement) => number;
}

export interface RdxCompositeRootContext {
    rootElement: HTMLElement;
    highlightedIndex: Signal<number>;
    highlightItemOnHover: Signal<boolean>;
    orientation: Signal<RdxCompositeOrientation>;
    dir: Signal<Direction>;
    isIndexDisabled: (index: number) => boolean;
    setHighlightedIndex: (index: number, shouldScrollIntoView?: boolean) => void;
    relayKeyboardEvent: (event: KeyboardEvent) => void;
}
