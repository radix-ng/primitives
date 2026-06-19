import { RdxCompositeList, RdxCompositeMetadata, isElementVisible } from '@radix-ng/primitives/composite';

export type RdxMenuCompositeItemType =
    | 'regular-item'
    | 'checkbox-item'
    | 'radio-item'
    | 'link-item'
    | 'submenu-trigger';

export interface RdxMenuCompositeItemMetadata {
    [key: string]: unknown;
    type: RdxMenuCompositeItemType;
    disabled: boolean;
    label?: string | undefined;
}

export interface RdxMenuCompositeItem {
    element: HTMLElement;
    index: number;
    label: string;
    metadata: RdxCompositeMetadata<RdxMenuCompositeItemMetadata>;
}

/** Selector for menu items within a popup. Disabled items stay focusable to match Base UI. */
export const RDX_MENU_ITEM_SELECTOR = [
    '[rdxMenuItem]',
    '[rdxMenuCheckboxItem]',
    '[rdxMenuRadioItem]',
    '[rdxMenuLinkItem]',
    '[rdxMenuSubTrigger]'
].join(',');

export function getFocusableMenuItems(popup: HTMLElement): HTMLElement[] {
    return Array.from(popup.querySelectorAll<HTMLElement>(RDX_MENU_ITEM_SELECTOR)).filter(
        (item) => item.closest('[rdxMenuPopup]') === popup
    );
}

export function getCompositeMenuItems(list: RdxCompositeList): RdxMenuCompositeItem[] {
    const map = list.itemMap();

    return list
        .items()
        .map(({ element }) => {
            const metadata = map.get(element) as RdxCompositeMetadata<RdxMenuCompositeItemMetadata> | undefined;

            if (!metadata || !isElementVisible(element)) {
                return null;
            }

            return {
                element,
                index: metadata.index,
                label: getMenuItemLabel(element, metadata),
                metadata
            };
        })
        .filter((item): item is RdxMenuCompositeItem => item !== null);
}

export function getDomMenuItems(popup: HTMLElement): RdxMenuCompositeItem[] {
    return getFocusableMenuItems(popup).map((element, index) => ({
        element,
        index,
        label: getMenuItemLabel(element),
        metadata: {
            index,
            type: getMenuItemType(element),
            disabled: element.hasAttribute('data-disabled'),
            label: element.dataset['label']
        }
    }));
}

export function getMenuItemLabel(element: HTMLElement, metadata?: Pick<RdxMenuCompositeItemMetadata, 'label'>): string {
    return (metadata?.label ?? element.dataset['label'] ?? element.textContent?.trim() ?? '').toLowerCase();
}

function getMenuItemType(element: HTMLElement): RdxMenuCompositeItemType {
    if (element.hasAttribute('rdxMenuCheckboxItem')) {
        return 'checkbox-item';
    }

    if (element.hasAttribute('rdxMenuRadioItem')) {
        return 'radio-item';
    }

    if (element.hasAttribute('rdxMenuLinkItem')) {
        return 'link-item';
    }

    if (element.hasAttribute('rdxMenuSubTrigger')) {
        return 'submenu-trigger';
    }

    return 'regular-item';
}
